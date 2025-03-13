import os

def copy_or_append(source_file, target_file):
    try:
        # Open the source file and read its content
        with open(source_file, 'r') as source:
            content = source.read()

        content_with_filename = f"File: {source_file}\n\n{content}"

        # Open the target file in append mode (it creates the file if it doesn't exist)
        with open(target_file, 'a') as target:
            target.write(content_with_filename)
            

    
    except FileNotFoundError:
        print(f"Error: The source file '{source_file}' does not exist.")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__=="__main__":
    save_path='fullscript.txt'
    if os.path.isfile(save_path):
        os.remove(save_path)

    js=[file for file in os.listdir() if (file.endswith('.js') and 'temp' not in file) or (file.endswith('.html'))]
    for file in js:
        copy_or_append(file,save_path)

    content='''
            These and multiple .js scripts that i have
            merged for the purposes of giving to you only need to modify the relevant scripts not
            everything. the purpose of the script is to display the model and make it interactable but currently it
            fails to do that for the following reasons:

        '''

    with open(save_path,'a') as target:
        target.write(content)

