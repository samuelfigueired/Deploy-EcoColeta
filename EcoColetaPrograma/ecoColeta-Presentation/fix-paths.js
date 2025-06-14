const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const htmlDir = path.join(__dirname, 'public');

// Get all HTML files in the public directory
const getAllHtmlFiles = (dir) => {
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(dir, file));
};

const fixFilePaths = async (filePath) => {
  try {
    // Read the HTML file
    let content = await readFileAsync(filePath, 'utf8');

    // Fix CSS paths
    content = content.replace(/href="\.\.\/src\/css\/(.*?)"/g, 'href="css/$1"');
    
    // Fix JS paths
    content = content.replace(/src="\.\.\/src\/js\/(.*?)"/g, 'src="js/$1"');
    
    // Fix direct root references to CSS (if any)
    content = content.replace(/href="styles\.css"/g, 'href="css/styles.css"');
    
    // Write the fixed content back to the file
    await writeFileAsync(filePath, content);
    console.log(`Fixed paths in ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// Process all HTML files
const processAllFiles = async () => {
  const htmlFiles = getAllHtmlFiles(htmlDir);
  
  for (const file of htmlFiles) {
    await fixFilePaths(file);
  }
  console.log('All files processed successfully');
};

processAllFiles();
