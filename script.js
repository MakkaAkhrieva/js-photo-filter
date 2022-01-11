const canvas = document.querySelector('canvas'),
      ctx = canvas.getContext('2d'),
      image = document.querySelector('.filters__img'),
      css = document.querySelector('.code__input');

// STATE for out app
const STATE = {
    baseUrl: 'https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images',
    count: 1,
    initalForm: {
        blur: 0,
        invert: 0,
        sepia: 0,
        saturate: 100,
        hue: 0,
        brightness: 100,
        opacity: 100
    },
    form: {
        blur: 0,
        invert: 0,
        sepia: 0,
        saturate: 100,
        hue: 0,
        brightness: 100,
        opacity: 100
    },
    imgWidth: 0,
    imgHeight: 0
}

// Toggle Fullscreen
const toggleFullscreen = () => {
    document.fullscreenElement !== null
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen();
}

// Copy To Clipboard
const copyToClipboard = () => {
    const copyText = document.querySelector(".code__input");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
}

// Change filters
const changeFilters = (element) => {
    element.previousElementSibling.textContent = element.value;
    element.nextElementSibling.value = element.value;
    STATE.form[element.name] = +element.value;

    // Change image and canvas filters
    canvas.style.setProperty(`--${element.name}`, ` ${element.value}${element.dataset.sizing}`);
    image.style.setProperty(`--${element.name}`, ` ${element.value}${element.dataset.sizing}`);
    css.value = getProperties();
}

// Change range value with output and filters
const changeOutputFilter = (e) => {
    const element = e.target;
    const spanElement = element.previousElementSibling.previousElementSibling;
    const inputElement = element.previousElementSibling;
    spanElement.textContent = element.value;
    inputElement.value = element.value;
    STATE.form[element.name] = element.value;
    
    image.style.setProperty(`--${element.name}`, ` ${element.value}${inputElement.dataset.sizing}`);
    css.value = getProperties();
}

// Reset filters
const resetFiltets = () => {
    for (let key in STATE.form) {
        STATE.form[key] = STATE.initalForm[key]; 
    }
    filterInputs.forEach(item => {
        item.value = STATE.form[item.name];
        item.nextElementSibling.value = STATE.form[item.name];
        changeFilters(item)
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Get fresh filter properties
const getProperties = () => { 
    const coefficient = STATE.imgWidth >= STATE.imgHeight ? STATE.imgWidth / 820 : STATE.imgHeight / 520;
    console.log(STATE.imgWidth, image.width);
    return `blur(${Math.floor((coefficient !== 0 ? coefficient * STATE.form.blur : 1 * STATE.form.blur) * 100) / 100}px) invert(${STATE.form.invert}%) sepia(${STATE.form.sepia}%) saturate(${STATE.form.saturate}%) hue-rotate(${STATE.form.hue}deg) brightness(${STATE.form.brightness}%) opacity(${STATE.form.opacity}%)`;
}

// Download or save picture to your PC
const downloadImage = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = getProperties();
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    const link = document.createElement('a');
    link.download = 'download.png';
    link.href = canvas.toDataURL();
    link.click();
    link.delete;
}

// Load Image to filter
const loadImage = (event) => {
    const file = event.target.files[0];
    const FileRead = new FileReader();

    if(file) {
        FileRead.readAsDataURL(file);
    }

    FileRead.onload = () => {
        drawImage(FileRead.result);
        event.target.value = null;
    }
}

// Draw Image 
const drawImage = (src) => {
    const res = document.querySelector('.filters__result');
    res.classList.remove('loaded');

    const img = new Image();
    img.src = src;
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        STATE.imgHeight = img.height;
        STATE.imgWidth = img.width;
        ctx.drawImage(image, 0, 0, img.width, img.height);
    }
    image.src = src;
    console.log(STATE);

    setTimeout(() => res.classList.add('loaded'), 1000);
}


// Next Picture, load from github
const nextPicture = () => {
    const hours = new Date().getHours();
    let { baseUrl } = STATE;

    const count = STATE.count++;
    if (count >= 20) {
        STATE.count = 1;
    }
    
    // Check hours and choose time of day
    if (hours >= 6 && hours < 12) {
        baseUrl += '/morning';
    } else if (hours >= 12 && hours < 18) {
        baseUrl += '/day';
    } else if (hours >= 18 && hours < 24) {
        baseUrl += '/evening';
    } else {
        baseUrl += '/night';
    }

    baseUrl += count < 10 ? `/0${count}.jpg` : `/${count}.jpg`;
    image.crossOrigin = '*';
    image.src = baseUrl;
    image.crossOrigin = '*';

    drawImage(baseUrl);
}

// Buttons change active class
const filterButtonsActive = (e) => {
    buttons.forEach(item => item.classList.remove('btn--active'));
    if(e.target.classList.contains('btn--load--input')) {
        e.target.parentElement.classList.add('btn--active');
    } else {
        e.target.classList.add('btn--active');
    }
}

// Switch Theme with checkbox
const switchTheme = (e) => {
    if(e.target.checked) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Buttons
const loadImageInput = document.querySelector('.btn--load--input'),
      resetButton = document.querySelector('.btn--reset'),
      downloadButton = document.querySelector('.btn--save'),
      nextPictureButton = document.querySelector('.btn--next'),
      fullscreenButton = document.querySelector('.fullscreen'),
      filterInputs = document.querySelectorAll('input[type=range]'),
      buttons = document.querySelectorAll('.buttons .btn'),
      switchThemeButton = document.querySelector('#switcher-theme'),
      outputs = document.querySelectorAll('.output'),
      btn = document.querySelector('.copy-css');

// Events
drawImage('./assets/img/img.jpg')
fullscreenButton.addEventListener('click', toggleFullscreen);
loadImageInput.addEventListener('change', loadImage);
filterInputs.forEach(input => input.addEventListener('input', (item) => changeFilters(item.target)));
resetButton.addEventListener('click', resetFiltets);
downloadButton.addEventListener('click', downloadImage);
nextPictureButton.addEventListener('click', nextPicture);
switchThemeButton.addEventListener('change', (e) => switchTheme(e));
buttons.forEach(button => button.addEventListener('click', e => filterButtonsActive(e)));
outputs.forEach(item => item.addEventListener('input', (e) => changeOutputFilter(e)));
btn.addEventListener('click', () => copyToClipboard());


