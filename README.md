# Graphing Calculator

A simple React graphing calculator, using recursive descent parsing.

## Demo

You can try this project on my website at [lukenelson.io/projects/graph](https://lukenelson.io/projects/graph)

## Installation

Install the module into your project with `npm`
```bash
npm install luke07758/graphing-calculator
```
Import the Graph component to use it
```js
import Graph from "graphing-calculator";

export default () => {
	// ...
	return (
		<div>
			<Graph/>
		</div>
	);
};
```
Because the Graph component has CSS `width: 100%` and `height: 100%`, it is best to wrap in a div with specified height and width
```html
<div height="500px" width="1000px">
	<Graph/>
</div>
```

## Roadmap

This is very much still a work in progress. In future updates, I plan on adding the following features:

- Change function display to use MathJax
- Improve UI/UX