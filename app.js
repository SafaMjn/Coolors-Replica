//global variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const textHex = document.querySelectorAll('.color h2');

//color generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function generateRandomColors() {
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    //add color to bg
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    //check contrast
    checkTextContrast(randomColor, hexText);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  text.style.color = luminance > 0.5 ? '#1a1717' : '#fffafa';
}

generateRandomColors();
