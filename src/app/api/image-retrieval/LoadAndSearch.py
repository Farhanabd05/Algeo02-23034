import numpy as np
from PIL import Image
import pandas as pd
from processNewImage import grayscaleConvert, flattenImage
import os

def standardization(flattenImageSet):
    sigmaPixel = np.sum(flattenImageSet, axis=0) # array [jumlah pixel ke-j dari tiap image i]
    N = flattenImageSet.shape[0]
    M = flattenImageSet.shape[1]
    print("N" + str(N))
    print("M" + str(M))
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
    
    # Gabungkan index dan distance menjadi list of tuples
    list_tuples = [(idx, dist) for idx, dist in zip(closest_indices, closest_distances)]
    
    return list_tuples

def searchImage(imagePath: str, folderPath: str, imgSize=(50, 50), k=100, maxResult=5):
    qImage = Image.open(imagePath).resize(imgSize)
    qGray = grayscaleConvert(qImage)
    qFlattened = flattenImage(qGray)

    #load data
    dataset = np.loadtxt('dataset.txt')
    imagesNameSet = pd.read_csv('ImgName.txt', header=None).squeeze().values

    print("process img folder")
    standardizedDataset, mean = standardization(dataset)
    standardizedQ = qFlattened - mean   # (q' - mean)
    print("proses standar udah")

    # Apply PCA untuk proyeksi dataset dan query
    Z, Uk = pcaSVD(standardizedDataset, k)
    print("svd")
    ZqImage = standardizedQ @ Uk  # q =  (q' - mean) Uk
    print("proyeksi")

    # Find closest images using similarity
    closest_images = similarity(ZqImage, Z, maxResult)
    print("similarity")

    # Format hasil: kembalikan nama gambar beserta persentase kedekatan
    results = [(imagesNameSet[idx], percentage) for idx, percentage in closest_images]
    return results



query_image_path = "WIN_20241113_20_26_36_Pro.jpg"#"C:/Users/Muzaraar/Documents/Kuliah/Kelas_Kuliah/Semester_3/Algeo Tubes 2/hq720.jpg"
dataset_dir = "C:/Users/Muzaraar/Documents/Kuliah/Kelas_Kuliah/Semester_3/Algeo Tubes 2/dataGambar"
#"C:/Users/Muzaraar/Documents/Kuliah/Kelas_Kuliah\Semester_3\Algeo Tubes 2\WIN_20241113_20_26_36_Pro.jpg"
results = searchImage(query_image_path, dataset_dir, imgSize=(50, 50), k=100, maxResult=20)

print("Gambar terdekat (nama file, persentase kedekatan):")
for filename, percentage in results:
    print(f"File: {filename}, Kedekatan: {percentage:.2f}")






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





