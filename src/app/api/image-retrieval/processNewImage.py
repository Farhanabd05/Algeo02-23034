import numpy as np
import pandas as pd
from PIL import Image
import os
import argparse
from os import path
def grayscaleConvert(image):
    imgArray = np.asarray(image, dtype=np.float32)
    if len(imgArray.shape) == 3:  # RGB image (3D array)
        redArr = imgArray[:, :, 0]
        greenArr = imgArray[:, :, 1]
        blueArr = imgArray[:, :, 2]
        grayscale = 0.2989 * redArr + 0.5870 * greenArr + 0.1140 * blueArr  # Weighted grayscale conversion
    elif len(imgArray.shape) == 2:  # Grayscale image (2D array)
        grayscale = imgArray  # No need for conversion
    else:
        raise ValueError("Unsupported image format!")
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
    np.savetxt('imgDataset.txt', dataset)
    return dataset, imagesNameSet

def inputNewImage(folderPath:str, imgSize=(50,50)):
    path_to_dataset = os.path.join(os.getcwd(), 'database', 'imgDataset.txt')
    path_to_imgName = os.path.join(os.getcwd(), 'database', 'ImgName.txt')
    dataset = np.loadtxt(path_to_dataset)
    imagesNameSet = pd.read_csv(path_to_imgName, header=None).squeeze().values

    for filename in os.listdir(folderPath):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            imgPath = os.path.join(folderPath, filename)
            image = Image.open(imgPath).resize(imgSize)
            grayscale = grayscaleConvert(image)
            flattened = flattenImage(grayscale)

            dataset = np.append(dataset, [flattened], axis=0)
            imagesNameSet = np.append(imagesNameSet, filename)
    np.savetxt(path_to_imgName, imagesNameSet, fmt='%s')
    np.savetxt(path_to_dataset, dataset)
    print("Proses Memasukan Gambar baru selesai")
    return

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--folder', help='Path to folder')
    args = parser.parse_args()
    inputNewImage(args.folder)
