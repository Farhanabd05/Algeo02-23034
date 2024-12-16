import mido

def display_midi_info(file_path):
    try:
        # Open the MIDI file
        midi = mido.MidiFile(file_path)

        # Display general file information
        print("--- General MIDI File Info ---")
        print(f"File Type: {midi.type}")
        print(f"Number of Tracks: {len(midi.tracks)}")
        print(f"Ticks per Beat: {midi.ticks_per_beat}")
        print()

        # Loop through the tracks to extract details
        for i, track in enumerate(midi.tracks):
            print(f"--- Track {i + 1}: {track.name} ---")

            # Display the name of the track if available
            if track.name:
                print(f"Track Name: {track.name}")
            else:
                print("Track Name: (None)")

            # Display events in the track
            print("Events:")
            for msg in track:
                print(f"  {msg}")

            print()

    except Exception as e:
        print(f"Error reading MIDI file: {e}")

# Example usage
file_path = input("Enter the path to the MIDI file: ")
display_midi_info(file_path)
