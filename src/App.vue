<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
:root {
  --primary: #001c3b;
  --primary-medium: #102f53;
  --primary-light: #84a5cc;
  --secondary-dark: #33283b;
  --secondary: #6f617a;
  --secondary-light: #c3b4cf;
  --secondary-medium: #8e7e9b;
  --success: #096b00;
  --warning: #c50d0d;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--primary);
}

button {
  background-color: var(--secondary);
  border: 2px solid var(--secondary);
  border-radius: 6px;
  color: white;
  padding: 6px 12px;
  margin: 4px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  transition-duration: 0.3s;
}

button:hover {
  background-color: var(--secondary-medium);
  color: white;
}

button.btn-alt {
  background-color: white;
  border: 2px solid var(--secondary);
  border-radius: 6px;
  color: var(--secondary-dark);
  padding: 4px 9px;
  margin: 4px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 12px;
  transition-duration: 0.3s;
}

button.btn-alt:hover {
  background-color: var(--secondary-light);
  color: white;
}

input[type=text] {
  color: var(--primary);
  font-size: 14px;
  width: 215px;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
  border: 2px solid var(--secondary-light);
  border-radius: 6px;
  outline: none;
  transition-duration: 0.3s;
}

input[type=text]:focus {
  width: 235px;
  padding: 12px 25px;
  border: 2px solid var(--secondary);
}

label.success {
  color: var(--success);
  font-size: 13px;
}

label.warning {
  color: var(--warning);
  font-size: 13px;
}

label.sliderLabel {
  color: var(--primary);
  font-size: 17px;
}

b {
  color: var(--primary-medium);
}

details.help {
  width: 300px;
  margin: 0 auto ;
  margin-top: 8px;
  overflow: hidden;
}

details.help > summary {
  width: 39px;
  margin: 0 auto ;
  display: block;
  padding-top: 0.15rem;
  padding-left: 0.65rem;
  position: relative;
  cursor: pointer;
  border: 2px solid var(--warning);
  border-radius: 6px;
}

details.help > summary:before {
  content: '';
  border-width: .3rem;
  border-style: solid;
  border-color: transparent transparent transparent var(--warning);
  position: absolute;
  top: .26rem;
  left: 0.4rem;
  transform: rotate(0);
  transform-origin: .1rem 50%;
  transition: .25s transform ease;
}

details.help[open] > summary:before {
  transform: rotate(90deg);
}

details.help > summary::-webkit-details-marker {
  display:none;
}
details.help > ul {
  margin-left: 0;
  padding-bottom: 1.2rem;
  margin-bottom: 0;
}
details.help > ul > li {
  text-align: left;
  margin-left: 0;
  padding-bottom: 0.4rem;
  margin-bottom: 0;
}

.slidecontainer {
  width: 100%;
  padding-top: 40px;
}

.slider {
  -webkit-appearance: none;
  width: 50%;
  height: 8px;
  border-radius: 16px;
  background: var(--secondary);
  outline: none;
  margin-right: 22px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 32px;
  border-radius: 19px; 
  border: 4px solid var(--secondary);
  background: var(--secondary-light);
  background: var(--secondary-medium);
  border: 4px solid var(--secondary);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 32px;
  border-radius: 19px; 
  background: var(--secondary-medium);
  border: 4px solid var(--secondary);
  cursor: pointer;
}


</style>