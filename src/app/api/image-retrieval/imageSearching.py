# src/api/image-retrieval/imageSearching.py
import numpy as np
from PIL import Image
import os
import sys
import json
import basic_pitch
def grayscaleConvert(image):
    imgArray = np.asarray(image, dtype=np.float32)
    redArr = imgArray[:,:,0]
    greenArr = imgArray[:,:,1]
    blueArr = imgArray[:,:,2]
    grayscale = 0.2989*redArr + 0.5870*greenArr + 0.1140*blueArr
    return grayscale

def flattenImage(grayscale_image):
    M, N = grayscale_image.shape                            # M = baris, N = kolom
    flattened_vector = []
    for i in range(M):
        for j in range(N):
            flattened_vector.append(grayscale_image[i][j])
    return np.array(flattened_vector)

def standardization(flattenImageSet):
    sigmaPixel = np.sum(flattenImageSet, axis=0)                # array [jumlah pixel ke-j dari tiap image i]
    N = flattenImageSet.shape[0]
    M = flattenImageSet.shape[1]
    # print("N" + str(N))
    # print("M" + str(M))
    mean = sigmaPixel/N
    standardized = flattenImageSet - mean
    return standardized, mean

def pcaSVD(standarSet, k = 100):
    C = (1 / standarSet.shape[0]) * standarSet.T @ standarSet  # C = (1/N) X^T X
    U, Ev, Ut = np.linalg.svd(C, full_matrices=False)          # U@Ev@Ut = C
    Uk = U[:,:k]
    Z = standarSet @ Uk

    return Z, Uk

def similarity(ZqImage, datasetVector, maxResult=60):
    distances = np.linalg.norm(datasetVector - ZqImage, axis=1)  # axis=1 untuk menghitung jarak per baris
    sortedIdxImage = np.argsort(distances)
    sortedDistance = distances[sortedIdxImage]
    sortedIdxImage = sortedIdxImage[:maxResult]
    sortedDistance = sortedDistance[:maxResult]
    
    idxImg_Distance = [(idx, dist) for idx, dist in zip(sortedIdxImage, sortedDistance)]
    return idxImg_Distance
    

def processImageFolder(folderPath: str, imgSize=(64,64)):
    flattenedImageDataset = []
    imagesNameSet = []
    for filename in os.listdir(folderPath):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            imgPath = os.path.join(folderPath, filename)
            image = Image.open(imgPath).resize(imgSize)
            grayscale = grayscaleConvert(image)
            flattened = flattenImage(grayscale)
            imagesNameSet.append(filename)
            flattenedImageDataset.append(flattened)
    dataset = np.array(flattenedImageDataset)
    return dataset, imagesNameSet

def searchImage(imagePath: str, folderPath: str, imgSize=(64, 64), k=100, maxResult=5):
    qImage = Image.open(imagePath).resize(imgSize)
    qGray = grayscaleConvert(qImage)
    qFlattened = flattenImage(qGray)

    # Proses Dataset
    dataset, imagesNameSet = processImageFolder(folderPath, imgSize)
    standardizedDataset, mean = standardization(dataset)
    standardizedQ = qFlattened - mean

    # PCA untuk proyeksi dataset dan query
    Z, Uk = pcaSVD(standardizedDataset, k)
    ZqImage = standardizedQ @ Uk

    # Similarity Computation
    closestImageIndices = similarity(ZqImage, Z, maxResult)

    # Buat daftar hasil dengan nama file dan jarak
    results = [
        {
            'filename': imagesNameSet[idx], 
            'distance': float(dist)  # convert to native float
        } 
        for idx, dist in closestImageIndices
    ]
    
    # Cetak sebagai JSON agar mudah dibaca di sisi server
    print(json.dumps(results))




if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python imageSearching.py <query_image_path> <dataset_dir>")
        sys.exit(1)

    query_image_path = sys.argv[1]
    dataset_dir = sys.argv[2]
    searchImage(query_image_path, dataset_dir)



# query_image_path = "C:/Users/Muzaraar/Documents/Kuliah/Kelas_Kuliah/Semester_3/Algeo Tubes 2/hq720.jpg"
# dataset_dir = "C:/Users/Muzaraar/Documents/Kuliah/Kelas_Kuliah/Semester_3/Algeo Tubes 2/dataGambar"
# results = searchImage(query_image_path, dataset_dir, imgSize=(100, 100), k=100, maxResult=5)
# for filename, percentage in results:
#     print(f"File: {filename}, Kedekatan: {kedekatan:.2f}")


