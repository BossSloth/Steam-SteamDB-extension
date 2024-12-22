import os
import zipfile
import subprocess
import sys
from pathlib import Path

# Global configuration
EXCLUDED_DIRS = {
    '.git', '.venv', 'node_modules', 'helpers', 'webkit', 'frontend',
    '__pycache__', 'Images', '.github',
}

EXCLUDED_FILES = {
    '.gitignore', 'tsconfig.json', 'bun.lockb', 'package.json',
    'steamdb-plugin.zip',
}

def run_build():
    print("Running bun build...")
    # Change to project root directory
    root_dir = Path(__file__).parent.parent
    os.chdir(root_dir)
    
    try:
        # Use shell=True on Windows for local execution
        use_shell = os.name == 'nt'  # True on Windows, False on Unix
        
        # Run bun run build command
        process = subprocess.Popen(['bun', 'run', 'build'], 
                                shell=use_shell,
                                stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE,
                                universal_newlines=True,
                                cwd=str(root_dir))
        
        finished = False
        
        # Print output in real-time
        while True:
            output = process.stdout.readline()
            if output:
                print(output.strip())
            if "Build succeeded" in output:
                finished = True
            # Print any errors
            error = process.stderr.readline()
            if error:
                print(error.strip(), file=sys.stderr)
            # If process is finished, break the loop
            if output == '' and error == '' and process.poll() is not None:
                break
        
        if process.returncode != 0 or not finished:
            print("Build failed")
            return False
            
        print("Build completed successfully")
        return True
    except Exception as e:
        print(f"Error running build: {e}")
        return False

def should_include_file(file_path: Path, root_dir: Path) -> bool:
    # Always include built files from Dist
    if 'Dist' in str(file_path):
        return file_path.name.endswith('.js')
        
    # Check if file is in excluded directory
    rel_path = file_path.relative_to(root_dir)
    if any(part in EXCLUDED_DIRS for part in rel_path.parts):
        return False
        
    # Check if file is excluded
    if file_path.name in EXCLUDED_FILES:
        return False
        
    return True

def create_zip():
    # Get version from environment variable, default to empty string if not set
    version = os.environ.get('RELEASE_VERSION', '')
    if not version:
        print("Error: RELEASE_VERSION environment variable is required")
        return False
        
    zip_name = f"SteamDB-plugin-{version}.zip"
    
    # Get the root directory of the project
    root_dir = Path(__file__).parent.parent
    build_dir = root_dir / 'build'
    build_dir.mkdir(parents=True, exist_ok=True)
    zip_path = build_dir / zip_name
    print(f"\nCreating zip file: {zip_path}")

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(root_dir):
            # Remove excluded directories to prevent walking into them
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            
            for file in files:
                file_path = Path(root) / file
                
                # Skip the zip file itself
                if ".zip" in file_path.name:
                    continue
                    
                if should_include_file(file_path, root_dir):
                    # Get the relative path and add root folder
                    rel_path = file_path.relative_to(root_dir)
                    zip_path_with_root = Path('SteamDB-plugin') / rel_path
                    print(f"Adding: {zip_path_with_root}")
                    zipf.write(file_path, str(zip_path_with_root))

def main():
    if not run_build():
        exit(1)        
    
    if not create_zip():
        exit(1)
    print("\nBuild and zip creation completed!")

if __name__ == "__main__":
    main()
