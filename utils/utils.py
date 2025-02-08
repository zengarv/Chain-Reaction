import os

def aggregate_code_files(folder_path, output_file="aggregated_code.txt"):
    """
    Walks through the directory tree starting at folder_path,
    finds files with specified extensions, and writes their
    relative paths and contents into output_file.

    Parameters:
        folder_path (str): The root directory to search.
        output_file (str): The path to the output text file.
    """
    # Define the file extensions you want to include.
    allowed_extensions = {'.ts', '.tsx', '.js', '.jsx', '.css', '.html'}

    # Open the output file in write mode.
    with open(output_file, 'w', encoding='utf-8') as out_f:
        # Walk through all subdirectories and files.
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                # Get the file's extension and check if it's allowed.
                ext = os.path.splitext(file)[1].lower()
                if ext in allowed_extensions:
                    file_full_path = os.path.join(root, file)
                    # Compute the file's path relative to the folder_path.
                    relative_path = os.path.relpath(file_full_path, folder_path)

                    # Write the relative path as a heading.
                    out_f.write(f"===== {relative_path} =====\n")
                    try:
                        # Open and read the file's contents.
                        with open(file_full_path, 'r', encoding='utf-8') as in_f:
                            code = in_f.read()
                    except Exception as e:
                        code = f"Error reading file: {e}"
                    
                    # Write the file content and add some spacing.
                    out_f.write(code + "\n\n")

aggregate_code_files(r"C:\Users\akki\Documents\Projects\Chain Reaction\Chain Reaction\src", 
                     r"C:\Users\akki\Documents\Projects\Chain Reaction\Chain Reaction\utils\code.txt")