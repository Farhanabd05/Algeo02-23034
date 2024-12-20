import numpy as np
from PIL import Image
import pandas as pd
from processNewImage import grayscaleConvert, flattenImage
import os
import sys
import json
def standardization(flattenImageSet):
    sigmaPixel = np.sum(flattenImageSet, axis=0) # array [jumlah pixel ke-j dari tiap image i]
    N = flattenImageSet.shape[0]
    M = flattenImageSet.shape[1]
    # print("N" + str(N))
    # print("M" + str(M))
    mean = sigmaPixel/N
    standardized = flattenImageSet - mean
    return standardized, mean

def pcaSVD(standarSet, k = 100):
    C = (1 / standarSet.shape[0]) * standarSet.T @ standarSet #(1/N) X^T X
    U, Ev, Ut = np.linalg.svd(C, full_matrices=False)
    Uk = U[:,:k]
    # print(str(standarSet.shape[0]), str(standarSet.shape[1]))
    # print(str(U.shape[0]), str(U.shape[1]))
    # print(str(Ut.shape[0]), str(Ut.shape[1]))
    # print(str(Utk.shape[0]), str(Utk.shape[1]))
    # print(str(C.shape[0]), str(C.shape[1]))
    Z = standarSet @ Uk #k = 100

    return Z, Uk

def similarity(query_vector, dataset_vectors, max_results=60):
    distances = np.linalg.norm(dataset_vectors - query_vector, axis=1)  # axis=1 untuk menghitung jarak per baris
    sorted_indices = np.argsort(distances)  # Urutkan indeks berdasarkan jarak
    sorted_distances = distances[sorted_indices]  # Jarak yang sudah diurutkan
    closest_indices = sorted_indices[:max_results]
    closest_distances = sorted_distances[:max_results]
    
    max_distance = 50 * 50 * 5/100
    percentages = 100 - sorted_distances / max_distance
    
    # Gabungkan index dan distance menjadi list of tuples
    list_tuples = [(idx, dist) for idx, dist in zip(sorted_indices, percentages)]
    
    return list_tuples

def searchImage(imagePath: str, folderPath: str, imgSize=(50, 50), k=100, maxResult=5):
    qImage = Image.open(imagePath).resize(imgSize)
    qGray = grayscaleConvert(qImage)
    qFlattened = flattenImage(qGray)
    
    path_to_dataset = os.path.join(os.getcwd(), 'database', 'imgDataset.txt')
    path_to_imgName = os.path.join(os.getcwd(), 'database', 'ImgName.txt')
    #load data
    dataset = np.loadtxt(path_to_dataset)
    imagesNameSet = pd.read_csv(path_to_imgName, header=None).squeeze().values

    standardizedDataset, mean = standardization(dataset)
    standardizedQ = qFlattened - mean   # (q' - mean)

    # Apply PCA untuk proyeksi dataset dan query
    Z, Uk = pcaSVD(standardizedDataset, k)
    ZqImage = standardizedQ @ Uk  # q =  (q' - mean) Uk

    # Find closest images using similarity
    closest_images = similarity(ZqImage, Z, maxResult)

    # Format hasil: kembalikan nama gambar beserta persentase kedekatan
    results = [
        {
            'filename': imagesNameSet[idx], 
            'distance': float(dist)  # convert to native float
        } 
        for idx, dist in closest_images
    ]
        
    # Cetak sebagai JSON agar mudah dibaca di sisi server
    print(json.dumps(results))



# query_image_path = "src/app/api/image-retrieval/【オリジナルMV】VALIS − 022「無窮プラトニック」【VALIS合唱】.jpg"  #"C:/Users/Muzaraar/Documents/Kuliah/Kelas_Kuliah/Semester_3/Algeo Tubes 2/hq720.jpg"
# dataset_dir = "C:/Users/Muzaraar/Documents/Kuliah/Kelas_Kuliah/Semester_3/Algeo Tubes 2/dataGambar"
# #"C:/Users/Muzaraar/Documents/Kuliah/Kelas_Kuliah\Semester_3\Algeo Tubes 2\WIN_20241113_20_26_36_Pro.jpg"
# results = searchImage(query_image_path, dataset_dir, imgSize=(50, 50), k=100, maxResult=20)

# print("Gambar terdekat (nama file, persentase kedekatan):")
# for filename, percentage in results:
#     print(f"File: {filename}, Kedekatan: {percentage:.2f}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python LoadAndSearch.py <query_image_path> <dataset_dir>")
        sys.exit(1)

    query_image_path = sys.argv[1]
    dataset_dir = sys.argv[2]
    searchImage(query_image_path, dataset_dir)




# flattenSet = []
# dataset = np.array([
#     [[10, 20, 30], [40, 50, 60], [70, 80, 90]],
#     [[15, 25, 35], [45, 55, 65], [75, 85, 95]],
#     [[20, 30, 40], [50, 60, 70], [80, 90, 100]],
# ])

# flattenSet = [flattenImage(i) for i in dataset]
# flattenSet = np.array(flattenSet)
# stand = standardization(flattenSet)
# print(stand)





