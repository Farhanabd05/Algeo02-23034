import numpy as np
import pandas as pd
from PIL import Image
import os

def grayscaleConvert(image):
    imgArray = np.asarray(image, dtype=np.float32)
    redArr = imgArray[:,:,0]
    greenArr = imgArray[:,:,1]
    blueArr = imgArray[:,:,2]
    grayscale = 0.2989*redArr + 0.5870*greenArr + 0.1140*blueArr
    #print(grayscale)
    return grayscale

def flattenImage(grayscale_image):
    M, N = grayscale_image.shape                # M = baris, N = kolom
    flattened_vector = []
    for i in range(M):
        for j in range(N):
            flattened_vector.append(grayscale_image[i][j])
    return np.array(flattened_vector)

def processImageFolder(folderPath: str, imgSize=(50,50)):
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
            print("per image")
    dataset = np.array(flattenedImageDataset)
    imagesNameSet = np.array(imagesNameSet)

    np.savetxt('ImgName.txt', imagesNameSet, fmt='%s')      # save to txt
    np.savetxt('dataset.txt', dataset)
    return dataset, imagesNameSet

def inputNewImage(folderPath:str, imgSize=(50,50)):
    dataset = np.loadtxt('dataset.txt')
    imagesNameSet = pd.read_csv('ImgName.txt', header=None).squeeze().values

    

    np.savetxt('ImgName.txt', imagesNameSet, fmt='%s')
    np.savetxt('dataset.txt', dataset)
    print("Proses Memasukan Gambar baru selesai")
    return