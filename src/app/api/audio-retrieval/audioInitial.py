from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH
import os
import sys



if __name__ == "__main__":
    input_file = sys.argv[1]

    if os.path.splitext(input_file)[1] != ".mid":
        predict_and_save(
            audio_path_list=[input_file],
            output_directory=os.path.dirname(input_file),
            save_midi=True,
            sonify_midi=False,
            save_model_outputs=False,
            save_notes=False,
            model_or_model_path=ICASSP_2022_MODEL_PATH
        )