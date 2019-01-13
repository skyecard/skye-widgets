# skye-widgets
A collection of skyecard widgets

# How to build
```
cd /to/this/directory
npm install
npm run build
```

# Dependencies
This widget builder uses the following key technologies:
* [nodejs](https://nodejs.org/en/)
* [npm](https://www.npmjs.com/get-npm)
* [webpack](https://webpack.js.org/guides/getting-started/)
* [typescript](https://www.typescriptlang.org/#download-links)
* [jquery](https://www.npmjs.com/package/jquery)
* [jquery-modal](http://jquerymodal.com/)

# Usage
In the location you require the widget, use the following markup:

## Widget
```
<script id="skye-widget" src="/skye-widget.js?id=AAA&productPrice=0"></script>
```

## Calculator
```
<script id="skye-widget" src="/skye-calc.js?id=AAA&productPrice=0"></script>
```

The script will bring in all of its CSS and dependencies, and register the button click events 

Guide: Installation guide is located at https://tools.skyecard.com.au/node/85
