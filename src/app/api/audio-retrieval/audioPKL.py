import pickle
from audioSearching import Features
import os
PKL_PATH = os.path.join(os.getcwd(), "database", "audioDataset.pkl")








if __name__ == "__main__":
    with open(PKL_PATH, "rb") as file:
        database: list[tuple[str, Features]] = pickle.load(file)
    
    for music in database:
        print(music[0])