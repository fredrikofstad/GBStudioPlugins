# Plugin Collection for GB Studio 3.1

This is a collection (currently one) of plugins I've written for GB Studio.

## How to install

Download and extract the zip file into the root of your project directory.

Ex:
The resulting folder structure should be : C:\PATHTOPROJECT\PROJECT_DIRECTORY\plugins\SwapTiles\events\eventSwapTiles.js

## Swap Tiles

This plugin is mostly a quality of life script as it replaces the time consuming task of adding GBVM commands line by line and having to worry about pushing and popping values to the stack. 

Instead just plop a few values into the event script and you'll be animating tiles in no time!

You can choose to change between 1-8 tiles, either 8x8 or 16x16 and how many frames you wish to be animated.
For infinte loop animations this event should be put into an actor's update loop (alternatively a timer). The wait time between frames is entered directly into the event script.

Besides animating your rivers and waterfalls, you can use this plugin for HUDs, menus, and other graphical changes to your scene.

//something about unique tiles

### Guide - How to use the Swap Tiles plugin 

For more information about tile swapping please read: [GB Studio central's guide](https://gbstudiocentral.com/tips/animating-background-tiles-3-1/) 

First let's prepare our tilesheets. In order to swap tiles we first need to create a new scene with a tilesheet consisiting of all the tiles we want to swap. If you want to swap 16x16 tiles, the tiles have to be in the following order: Top left, top right, bottom left, bottom right. If you want several frames of animation the tiles have to come directly after eachother.

<img src="https://github.com/fredrikofstad/GBStudioPlugins/blob/master/res/preperation.png?raw=true" width="400">

For our game scene we need to insert unique tiles where we want the tiles to be swapped, or else every tile that shares the same 8x8 image will change. In the picture you can see that I used the gbs-mono tileset.

Now that everything is set up we can insert the script from Add Event->Plugins->Swap Tiles. If placed in an on init, the script will be run once. If you want a continous animation place the script in an actors On Update.

- Tile Size is how big the tiles you want to swap are, either 8x8 or 16x16.

- Frames of animation are how many frames are in your animation, for a one time swap input 1.

- Number of tiles to be swapped are how many tiles you want to swap at the same time. In an update loop all these tiles will be swapped before moving to the next iteration.

For every tile input the unique x and y coordinate from your game scene. If you chos 16x16 mode you only need to specify the top left tile. In my case the @ mark is x = 3 and y = 6. 
Nexy input the x and y values of the tile you want to swap to from the swap-tileset. And once again, if you chose 16x16 mode you only need the first tile. In my case I want the image of an egg so I input x = 4 and y = 3.

Frames to wait between swaps. If you are animating the tiles, this is where you specify the duration before swapping.

Tilemap name. This is the name of the tilemap with the tiles you are swapping to. It's the filename of the picture in lowercase letters without the file extension. E.x. if you called your file SwapTileset.png, input swaptileset.

Length of tileset is how many 8x8 tiles fit horizontally, and is when the script converts from coordinates to tile index. A 160x144 screen has 20 tiles, which is the default.


<img src="https://github.com/fredrikofstad/GBStudioPlugins/blob/master/res/result.png?raw=true" width="600">



I hope this script speeds up your development time!

The following scene took me around 5 minutes after setting up the tilesheet:

<img src="https://github.com/fredrikofstad/GBStudioPlugins/blob/master/res/animated.gif?raw=true" width="300">

(Please excuse the gif compression)




## Download Plugins

You can download the plugin here:

