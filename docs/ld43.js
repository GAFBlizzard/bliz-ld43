
//
// LD43 game Monastic copyright (c) 2018 GAFBlizzard AKA AgentElrond.
//


//
// Constants.
//

var ACTOR_CLICKED       = 0;
var ACTOR_DRAG_START    = 1;
var ACTOR_DRAG_END      = 2;
var ACTOR_SACRIFICE     = 3;

var PLAYER_COLOR_BLUE   = 0;
var PLAYER_COLOR_RED    = 1;
var PLAYER_COLOR_BLACK  = 2;
var PLAYER_COLOR_WHITE  = 3;

var PLAYER_COLOR_START = PLAYER_COLOR_BLUE;
var PLAYER_COLOR_END = PLAYER_COLOR_WHITE;

var COLOR_NAMES = [ "Blue", "Red", "Black", "White" ];
var COLOR_TINTS = [ 0x00AADD, 0xEE0000, 0x333333, 0xFFFFFF ];

var DIRECTION_CLOCKWISE          = 0;
var DIRECTION_COUNTERCLOCKWISE   = 1;


//
// Global variables.
//

// NOTE:  World minimum must be <= (0, 0).  World maximum must be >= (appWidth, appHeight).
// TODO are these limits still applicable?  Varying app dimensions are probably fine.
var worldMinX = -340;
var worldMinY = -200;
var worldMaxX =  980;
var worldMaxY = 1080;

var appWidth = (window.innerWidth - 100);
var appHeight = (window.innerHeight - 200);
var containerStartX = 620;
var containerStartY = 270;
var containerPivotX = 620;
var containerPivotY = 350;
var curZoom = 1.0;

// The limits will be updated by a function call later.
var spriteContainerMinX = 0;
var spriteContainerMaxX = 0;
var spriteContainerMinY = 0;
var spriteContainerMaxY = 0;

var restartClickedOnce = false;
var hasPlayerMovedThisTurn = false;
var turnCount = 1;
var isGameOver = false;
var blueSacrificedDirection = null;
var blueSacrifice1 = null;
var blueSacrifice2 = null;
var redSacrificedDirection = null;
var redSacrifice1 = null;
var redSacrifice2 = null;
var blueSacrificesChosen = 0;
var redSacrificesChosen = 0;
var blueNeedsToChooseSacrifice = false;
var redNeedsToChooseSacrifice = false;

// TODO rename to take into account touch etc.?
var isMouseDown = false;
var isDragging = false;
var isPanning = false;
var dragStartLocation = null;
var dragStopLocation = null;
var actorBeingDragged = null;
// Note that this position is only known after the mouse is clicked.
var previousMouseX = 0;
var previousMouseY = 0;

var texture_card_1 = null;
var texture_card_2 = null;
var texture_card_3 = null;
var texture_card_library = null;
var texture_card_kitchen = null;
var texture_card_dormitory = null;
var texture_card_garden = null;
var texture_card_chapel_1 = null;
var texture_card_chapel_2 = null;
var texture_card_spring = null;
var texture_card_summer = null;
var texture_card_fall = null;
var texture_card_winter = null;
var texture_sacrifice_blue = null;
var texture_sacrifice_red = null;
var texture_button_end_turn = null;
var texture_button_pass_turn = null;
var texture_button_sacrifice_ccw = null;
var texture_button_sacrifice_cw = null;
var texture_button_restart = null;
var texture_button_ai_takeover = null;
var texture_monk_blue = null;
var texture_monk_red = null;
var texture_monk_black = null;
var texture_monk_white = null;
var texture_background = null;
var texture_space_highlight = null;

var uiContainer = null;
var spriteContainer = null;
var tokenContainer = null;

var ui_end_turn = null;
var ui_pass_turn = null;
var ui_sacrifice_ccw = null;
var ui_sacrifice_cw = null;
var ui_restart = null;
var ui_ai_takeover = null;

var aiPlayerColor = null;
var aiChoiceOptions = [ null, null, null,
                        null, null, null,
                        null, null, null ];

var sprite_kitchen = null;
var sprite_library = null;
var sprite_garden = null;
var sprite_dormitory = null;
var sprite_chapel_1 = null;
var sprite_chapel_2 = null;

var sprite_spring = null;
var sprite_summer = null;
var sprite_fall = null;
var sprite_winter = null;

var sprite_sacrifice_blue_1 = null;
var sprite_sacrifice_blue_2 = null;
var sprite_sacrifice_red_1 = null;
var sprite_sacrifice_red_2 = null;

var sprite_monk_blue = null;
var sprite_monk_red = null;
var sprite_monk_black = null;
var sprite_monk_white = null;

var monksByColor = [];

var space_kitchen_1 = null;
var space_library_1 = null;
var space_library_2 = null;
var space_garden_1 = null;
var space_dormitory_1 = null;
var space_dormitory_2 = null;
var space_chapel_1 = null;
var space_chapel_2A = null;
var space_chapel_2B = null;

var playersByColor = [ null, null, null, null ];
var numPlayersInGame = 0;
var curPlayerColor = 0;

var turnText = null;
var summaryStyle = null;
var blueSummaryText = null;
var redSummaryText = null;

var curMsgText = null;
var curMsgBackground = null;
var curMsgStyle = null;

var boardGameActors = [];


//
// Classes.
//

// Define board game player class.
class BoardGamePlayer
{
   constructor(initPlayerColor)
   {
      this.color = initPlayerColor;
      this.isInGame = true;
      this.hp = 5;
      this.learn = 0;
      this.holy = 0;
      this.rep = 0;
   }
}



// Define board game actor class.
class BoardGameActor extends PIXI.Container
{
   constructor(initX, initY, initHitWidth, initHitHeight)
   {
      super();

      // Inherited variables.
      this.x = initX;
      this.y = initY;
      this.pivot.x = (initHitWidth / 2.0);
      this.pivot.y = (initHitHeight / 2.0);
      this.hitArea = new PIXI.Rectangle((-0.25) * initHitWidth,
                                        (-0.25) * initHitHeight,
                                        (1.50 * initHitWidth),
                                        (1.50 * initHitHeight));

      // New variables.
      this.linkedSpace = null;
      // TODO consider if this needs to support multiple actors, e.g. for infinite chapel space
      this.linkedActor = null;
      this.blockingColor = null;
      this.isLegalTarget = false;
      this.isClickTarget = false;
      this.isDragSource = false;
      this.isDragTarget = false;
      this.highlightSprite = new PIXI.Sprite(texture_space_highlight);
      this.highlightSprite.visible = false;
      this.addChild(this.highlightSprite);
   }

   destroy(options)
   {
      super.destroy();
   }
}


//
// Startup code.
//

let type = "WebGL";

if (PIXI.utils.isWebGLSupported())
{
   type = "canvas";
}

PIXI.utils.sayHello(type);


let mainApp = new PIXI.Application({
  width: appWidth,
  height: appHeight,
  antialias: false,
  roundPixels: true,
  });
document.body.appendChild(mainApp.view);


// Load resources.
PIXI.loader
  .add([ "art/card_1_space.png",
         "art/card_2_spaces.png",
         "art/card_3_spaces.png",
         "art/card_library.png",
         "art/card_kitchen.png",
         "art/card_dormitory.png",
         "art/card_garden.png",
         "art/card_chapel_1.png",
         "art/card_chapel_2.png",
         "art/card_spring.png",
         "art/card_summer.png",
         "art/sacrifice_blue.png",
         "art/sacrifice_red.png",
         "art/card_fall.png",
         "art/card_winter.png",
         "art/button_end_turn.png",
         "art/button_pass_turn.png",
         "art/button_sacrifice_ccw.png",
         "art/button_sacrifice_cw.png",
         "art/button_restart.png",
         "art/button_ai_takeover.png",
         "art/monk_blue.png",
         "art/monk_red.png",
         "art/monk_black.png",
         "art/monk_white.png",
         "art/background.jpg",
         "art/space_highlight.png" ])
  .load(loadingFinished);
// TODO display loading progress?


//
// General functions.
//

function loadingFinished()
{
   // Set up players.

   let playerColor = PLAYER_COLOR_START;
   for (playerColor = PLAYER_COLOR_START; playerColor <= PLAYER_COLOR_END; playerColor++)
   {
      playersByColor[playerColor] = new BoardGamePlayer(playerColor);
   }

   // TODO update this if ever supporting more than 2 players
   playersByColor[PLAYER_COLOR_BLACK].isInGame = false;
   playersByColor[PLAYER_COLOR_WHITE].isInGame = false;

   dragStartLocation = new PIXI.Point(0, 0);
   dragStopLocation = new PIXI.Point(0, 0);

   // Set up text object(s).

   turnText = new PIXI.Text("Turn 1");

   summaryStyle = new PIXI.TextStyle({
     fontFamily: "Courier New",
     fontVariant: "bold",
     fontSize: 28,
     fill: "#FFFFFF",
     dropShadow: true,
     dropShadowDistance: 3,
     dropShadowAngle: (Math.PI / 8)});
   blueSummaryText = new PIXI.Text("", summaryStyle);
   redSummaryText = new PIXI.Text("", summaryStyle);

   curMsgStyle = new PIXI.TextStyle({
     fontFamily: "Times New Roman",
     fontVariant: "bold",
     fontSize: 36,
     stroke: "#000000",
     strokeThickness: 2,
     fill: "#FFFFFF",
     dropShadow: false});
   // TODO try drop shadow above?
   curMsgText = new PIXI.Text("Starting a new game...", curMsgStyle);
   curMsgText.x = (appWidth / 2.0);
   curMsgText.y = (appHeight - 20);
   // Center the text.
   curMsgText.anchor.x = 0.5;
   curMsgText.anchor.y = 0.5;
   // Create a background object.
   curMsgBackground = new PIXI.Sprite(PIXI.Texture.WHITE);
   curMsgBackground.x = 0;
   curMsgBackground.y = (appHeight - 40);
   curMsgBackground.width = appWidth;
   curMsgBackground.height = 40;
   curMsgBackground.tint = 0x666666;
   curMsgBackground.alpha = 0.95;

   // Get textures.

   texture_card_1 = PIXI.loader.resources["art/card_1_space.png"].texture;
   texture_card_2 = PIXI.loader.resources["art/card_2_spaces.png"].texture;
   texture_card_3 = PIXI.loader.resources["art/card_3_spaces.png"].texture;
   texture_card_library = PIXI.loader.resources["art/card_library.png"].texture;
   texture_card_kitchen = PIXI.loader.resources["art/card_kitchen.png"].texture;
   texture_card_dormitory = PIXI.loader.resources["art/card_dormitory.png"].texture;
   texture_card_garden = PIXI.loader.resources["art/card_garden.png"].texture;
   texture_card_chapel_1 = PIXI.loader.resources["art/card_chapel_1.png"].texture;
   texture_card_chapel_2 = PIXI.loader.resources["art/card_chapel_2.png"].texture;
   texture_card_spring = PIXI.loader.resources["art/card_spring.png"].texture;
   texture_card_summer = PIXI.loader.resources["art/card_summer.png"].texture;
   texture_card_fall = PIXI.loader.resources["art/card_fall.png"].texture;
   texture_card_winter = PIXI.loader.resources["art/card_winter.png"].texture;
   texture_sacrifice_blue = PIXI.loader.resources["art/sacrifice_blue.png"].texture;
   texture_sacrifice_red = PIXI.loader.resources["art/sacrifice_red.png"].texture;
   texture_button_end_turn = PIXI.loader.resources["art/button_end_turn.png"].texture;
   texture_button_pass_turn = PIXI.loader.resources["art/button_pass_turn.png"].texture;
   texture_button_sacrifice_ccw = PIXI.loader.resources["art/button_sacrifice_ccw.png"].texture;
   texture_button_sacrifice_cw = PIXI.loader.resources["art/button_sacrifice_cw.png"].texture;
   texture_button_restart = PIXI.loader.resources["art/button_restart.png"].texture;
   texture_button_ai_takeover = PIXI.loader.resources["art/button_ai_takeover.png"].texture;
   texture_monk_blue = PIXI.loader.resources["art/monk_blue.png"].texture;
   texture_monk_red = PIXI.loader.resources["art/monk_red.png"].texture;
   texture_monk_black = PIXI.loader.resources["art/monk_black.png"].texture;
   texture_monk_white = PIXI.loader.resources["art/monk_white.png"].texture;
   texture_background = PIXI.loader.resources["art/background.jpg"].texture;
   texture_space_highlight = PIXI.loader.resources["art/space_highlight.png"].texture;

   // Create sprites.

   uiContainer = new PIXI.Container();
   uiContainer.x = 0;
   uiContainer.y = 0;

   ui_end_turn                = new PIXI.Sprite(texture_button_end_turn);
   ui_end_turn.x              = 32;
   ui_end_turn.y              = (appHeight - 128);
   ui_end_turn.hitArea        = new PIXI.Rectangle(0, 0, ui_end_turn.width, ui_end_turn.height);

   ui_pass_turn               = new PIXI.Sprite(texture_button_pass_turn);
   ui_pass_turn.x             = 32;
   ui_pass_turn.y             = ((appHeight - 128) - 32);
   ui_pass_turn.hitArea       = new PIXI.Rectangle(0, 0, ui_pass_turn.width, ui_pass_turn.height);

   ui_sacrifice_ccw           = new PIXI.Sprite(texture_button_sacrifice_ccw);
   ui_sacrifice_ccw.x         = 32;
   ui_sacrifice_ccw.y         = ((appHeight / 2.0) - 32);
   ui_sacrifice_ccw.hitArea   = new PIXI.Rectangle(0, 0, ui_sacrifice_ccw.width, ui_sacrifice_ccw.height);

   ui_sacrifice_cw            = new PIXI.Sprite(texture_button_sacrifice_cw);
   ui_sacrifice_cw.x          = (appWidth - 232);
   ui_sacrifice_cw.y          = ((appHeight / 2.0) - 32);
   ui_sacrifice_cw.hitArea = new PIXI.Rectangle(0, 0, ui_sacrifice_cw.width, ui_sacrifice_cw.height);

   ui_restart                 = new PIXI.Sprite(texture_button_restart);
   ui_restart.x               = (appWidth - 200);
   ui_restart.y               = (appHeight - 128);
   ui_restart.interactive     = true;
   ui_restart.hitArea         = new PIXI.Rectangle(0, 0, ui_restart.width, ui_restart.height);

   ui_ai_takeover             = new PIXI.Sprite(texture_button_ai_takeover);
   ui_ai_takeover.x           = 32;
   ui_ai_takeover.y           = 32;
   ui_ai_takeover.interactive = true;
   ui_ai_takeover.hitArea     = new PIXI.Rectangle(0, 0, ui_ai_takeover.width, ui_ai_takeover.height);

   sprite_background       = new PIXI.extras.TilingSprite(texture_background, ((worldMaxX + 1) - worldMinX), ((worldMaxY + 1) - worldMinY));

   sprite_kitchen          = new PIXI.Sprite(texture_card_kitchen);
   sprite_library          = new PIXI.Sprite(texture_card_library);
   sprite_garden           = new PIXI.Sprite(texture_card_garden);
   sprite_dormitory        = new PIXI.Sprite(texture_card_dormitory);
   sprite_chapel_1         = new PIXI.Sprite(texture_card_chapel_1);
   sprite_chapel_2         = new PIXI.Sprite(texture_card_chapel_2);

   sprite_spring           = new PIXI.Sprite(texture_card_spring);
   sprite_summer           = new PIXI.Sprite(texture_card_summer);
   sprite_fall             = new PIXI.Sprite(texture_card_fall);
   sprite_winter           = new PIXI.Sprite(texture_card_winter);

   sprite_sacrifice_blue_1 = new PIXI.Sprite(texture_sacrifice_blue);
   sprite_sacrifice_blue_2 = new PIXI.Sprite(texture_sacrifice_blue);
   sprite_sacrifice_red_1  = new PIXI.Sprite(texture_sacrifice_red);
   sprite_sacrifice_red_2  = new PIXI.Sprite(texture_sacrifice_red);

   sprite_monk_blue        = new PIXI.Sprite(texture_monk_blue);
   sprite_monk_red         = new PIXI.Sprite(texture_monk_red);
   sprite_monk_black       = new PIXI.Sprite(texture_monk_blue);
   sprite_monk_white       = new PIXI.Sprite(texture_monk_white);

   // Set up game actors.

   let newActor = null;

   newActor = new BoardGameActor(22, 20, 50, 50);
   newActor.isDragSource = true;
   newActor.interactive = true;
   newActor.addChild(sprite_monk_blue);
   monksByColor[PLAYER_COLOR_BLUE] = newActor;
   boardGameActors.push(newActor);

   newActor = new BoardGameActor(22, 20, 50, 50);
   newActor.isDragSource = true;
   newActor.interactive = true;
   newActor.addChild(sprite_monk_red);
   monksByColor[PLAYER_COLOR_RED] = newActor;
   boardGameActors.push(newActor);

   // TODO add black and white monks here

   newActor = new BoardGameActor(60, 82, 50, 50);
   newActor.isDragTarget = true;
   newActor.interactive = true;
   space_kitchen_1 = newActor;
   boardGameActors.push(newActor);
   sprite_kitchen.addChild(newActor);

   newActor = new BoardGameActor(60, 50, 50, 50);
   newActor.isDragTarget = true;
   newActor.interactive = true;
   space_library_1 = newActor;
   boardGameActors.push(newActor);
   sprite_library.addChild(newActor);

   newActor = new BoardGameActor(60, 123, 50, 50);
   newActor.isDragTarget = true;
   newActor.interactive = true;
   space_library_2 = newActor;
   boardGameActors.push(newActor);
   sprite_library.addChild(newActor);

   newActor = new BoardGameActor(60, 82, 50, 50);
   newActor.isDragTarget = true;
   newActor.interactive = true;
   space_garden_1 = newActor;
   boardGameActors.push(newActor);
   sprite_garden.addChild(newActor);

   newActor = new BoardGameActor(60, 50, 50, 50);
   newActor.isDragTarget = true;
   newActor.interactive = true;
   space_dormitory_1 = newActor;
   boardGameActors.push(newActor);
   sprite_dormitory.addChild(newActor);

   newActor = new BoardGameActor(60, 123, 50, 50);
   newActor.isDragTarget = true;
   newActor.interactive = true;
   space_dormitory_2 = newActor;
   boardGameActors.push(newActor);
   sprite_dormitory.addChild(newActor);

   // TODO handle special case for multiple pieces instead of providing multiple spaces?
   //   If I kept the space approach, I would need to put 4 spaces for 4 players.
   newActor = new BoardGameActor(60, 82, 50, 50);
   newActor.isDragTarget = true;
   newActor.interactive = true;
   space_chapel_1 = newActor;
   boardGameActors.push(newActor);
   sprite_chapel_1.addChild(newActor);

   newActor = new BoardGameActor(60, 50, 50, 50);
   newActor.isDragTarget = true;
   newActor.interactive = true;
   space_chapel_2A = newActor;
   boardGameActors.push(newActor);
   sprite_chapel_2.addChild(newActor);

   newActor = new BoardGameActor(60, 123, 50, 50);
   newActor.isDragTarget = true;
   newActor.interactive = true;
   space_chapel_2B = newActor;
   boardGameActors.push(newActor);
   sprite_chapel_2.addChild(newActor);

   updateActorHighlights();

   sprite_background.x  = worldMinX;
   // TODO debug why this is needed instead of locking to (worldMinX, worldMinY)
   sprite_background.y  = worldMinY + 80;

   // Arrange building cards.

   sprite_kitchen.x     = 256;
   sprite_kitchen.y     = 32;

   sprite_library.x     = 96;
   sprite_library.y     = 244;

   sprite_garden.x      = 256;
   sprite_garden.y      = 244;

   sprite_dormitory.x   = 416;
   sprite_dormitory.y   = 244;

   sprite_chapel_2.x    = 256;
   sprite_chapel_2.y    = 456;

   sprite_chapel_1.x    = 256;
   sprite_chapel_1.y    = 668;

   sprite_monk_blue.x   = 2;
   sprite_monk_blue.y   = 0;

   sprite_monk_red.x    = 2;
   sprite_monk_red.y    = 0;

   // TODO add black/white monks

   sprite_spring.x      = 96;
   sprite_spring.y      = 456;

   sprite_summer.x      = 96;
   sprite_summer.y      = 456;

   sprite_fall.x        = 96;
   sprite_fall.y        = 456;

   sprite_winter.x      = 96;
   sprite_winter.y      = 456;

   turnText.x           = (sprite_spring.x + 24);
   turnText.y           = (sprite_spring.y + 24);

   blueSummaryText.x    = (sprite_library.x - 270);
   blueSummaryText.y    = (sprite_library.y + 70);

   redSummaryText.x     = (sprite_library.x - 270);
   redSummaryText.y     = (sprite_library.y + 220);

   sprite_sacrifice_blue_1.x  = 0;
   sprite_sacrifice_blue_1.y  = 0;
   sprite_sacrifice_blue_1.pivot.x = 12;
   sprite_sacrifice_blue_1.pivot.y = 12;
   sprite_sacrifice_blue_1.visible = false;
   sprite_sacrifice_blue_2.x  = 0;
   sprite_sacrifice_blue_2.y  = 0;
   sprite_sacrifice_blue_2.pivot.x = 12;
   sprite_sacrifice_blue_2.pivot.y = 12;
   sprite_sacrifice_blue_2.visible = false;
   sprite_sacrifice_red_1.x   = 0;
   sprite_sacrifice_red_1.y   = 0;
   sprite_sacrifice_red_1.pivot.x = 12;
   sprite_sacrifice_red_1.pivot.y = 12;
   sprite_sacrifice_red_1.visible = false;
   sprite_sacrifice_red_2.x   = 0;
   sprite_sacrifice_red_2.y   = 0;
   sprite_sacrifice_red_2.pivot.x = 12;
   sprite_sacrifice_red_2.pivot.y = 12;
   sprite_sacrifice_red_2.visible = false;

   // Place cards.

   spriteContainer = new PIXI.Container();
   spriteContainer.x = containerStartX;
   spriteContainer.y = containerStartY;
   spriteContainer.pivot.x = containerPivotX;
   spriteContainer.pivot.y = containerPivotY;

   tokenContainer = new PIXI.Container();
   tokenContainer.pivot.x = spriteContainer.pivot.x;
   tokenContainer.pivot.y = spriteContainer.pivot.y;

   updateContainerLimits();

   spriteContainer.addChild(sprite_background);

   spriteContainer.addChild(sprite_kitchen);
   spriteContainer.addChild(sprite_library);
   spriteContainer.addChild(sprite_garden);
   spriteContainer.addChild(sprite_dormitory);
   spriteContainer.addChild(sprite_chapel_1);
   spriteContainer.addChild(sprite_chapel_2);

   spriteContainer.addChild(sprite_spring);
   spriteContainer.addChild(sprite_summer);
   spriteContainer.addChild(sprite_fall);
   spriteContainer.addChild(sprite_winter);
   spriteContainer.addChild(sprite_sacrifice_blue_1);
   spriteContainer.addChild(sprite_sacrifice_blue_2);
   spriteContainer.addChild(sprite_sacrifice_red_1);
   spriteContainer.addChild(sprite_sacrifice_red_2);
   spriteContainer.addChild(turnText);
   spriteContainer.addChild(blueSummaryText);
   spriteContainer.addChild(redSummaryText);

   // TODO add black/white monks
   mainApp.stage.addChild(spriteContainer);

   tokenContainer.addChild(monksByColor[PLAYER_COLOR_BLUE]);
   tokenContainer.addChild(monksByColor[PLAYER_COLOR_RED]);
   mainApp.stage.addChild(tokenContainer);

   uiContainer.addChild(ui_end_turn);
   uiContainer.addChild(ui_pass_turn);
   uiContainer.addChild(ui_sacrifice_ccw);
   uiContainer.addChild(ui_sacrifice_cw);
   uiContainer.addChild(ui_restart);
   uiContainer.addChild(ui_ai_takeover);
   mainApp.stage.addChild(uiContainer);

   mainApp.stage.addChild(curMsgBackground);
   mainApp.stage.addChild(curMsgText);

   // Set up mouse support.
   // TODO consider touch and/or pointer support?

   mainApp.stage.hitArea = new PIXI.Rectangle(
     0,
     0,
     appWidth,
     appHeight);
   mainApp.stage.interactive = true;

   if (mainApp.renderer.plugins.interaction.supportsPointerEvents)
   {
      mainApp.stage.on("pointerdown", onMouseDown);
      mainApp.stage.on("pointermove", onMouseMove);
      mainApp.stage.on("pointerup", onMouseUp);
      mainApp.stage.on("pointerupoutside", onMouseUp);
   }
   else
   {
      mainApp.stage.on("mousedown", onMouseDown);
      mainApp.stage.on("mousemove", onMouseMove);
      mainApp.stage.on("mouseup", onMouseUp);
      mainApp.stage.on("mouseupoutside", onMouseUp);
   }

   if ("onorientationchange" in window)
   {
      // For mobile devices, detect orientation changes.
      window.addEventListener("onorientationchange", screenChangeHandler);
   }
   else
   {
      // Otherwise, just detect general resize behavior.
      window.addEventListener("resize", screenChangeHandler);
   }

   let wheelEventName = null;

   mainApp.view.addEventListener("wheel", wheelHandler);
   document.body.addEventListener("keydown", keyDownHandler);
   // TODO try to detect if this isn't supported?

   // Start game.

   startGame();
}

function screenChangeHandler()
{
   appWidth = (window.innerWidth - 100);
   appHeight = (window.innerHeight - 200);

   // Resize the renderer.

   mainApp.renderer.resize(appWidth, appHeight);

   // Resize things that are based on appWidth and/or appHeight.

   curMsgText.x                  = (appWidth / 2.0);
   curMsgText.y                  = (appHeight - 20);
   curMsgBackground.x            = 0;
   curMsgBackground.y            = (appHeight - 40);

   ui_end_turn.x                 = 32;
   ui_end_turn.y                 = (appHeight - 128);
   ui_pass_turn.x                = 32;
   ui_pass_turn.y                = ((appHeight - 128) - 32);
   ui_sacrifice_ccw.x            = 32;
   ui_sacrifice_ccw.y            = ((appHeight / 2.0) - 32);
   ui_sacrifice_cw.x             = (appWidth - 232);
   ui_sacrifice_cw.y             = ((appHeight / 2.0) - 32);
   ui_restart.x                  = (appWidth - 200);
   ui_restart.y                  = (appHeight - 128);
   ui_ai_takeover.x              = 32;
   ui_ai_takeover.y              = 32;

   mainApp.stage.hitArea.width   = appWidth;
   mainApp.stage.hitArea.height  = appHeight;

   // Reset the camera in case zoom needs updated.

   resetCamera();
}

function updateActorHighlights()
{
   let actorIndex = 0;
   let curActor = null;

   for(actorIndex = 0; actorIndex < boardGameActors.length; actorIndex++)
   {
      curActor = boardGameActors[actorIndex];

      if ((curActor.interactive === true)    &&
          (curActor.isLegalTarget === true))
      {
         if ((curActor.isClickTarget === true)                                ||
             (curActor.isDragSource === true)                                 ||
             ((curActor.isDragTarget === true) && (isDragging === true)))
         {
            curActor.highlightSprite.visible = true;
         }
         // TODO find a cleaner way to do this?
         else if ((curPlayerColor == PLAYER_COLOR_BLUE)  &&
                  (blueNeedsToChooseSacrifice === true)  &&
                  (curActor.isDragTarget === true))
         {
            curActor.highlightSprite.visible = true;
         }
         // TODO find a cleaner way to do this?
         else if ((curPlayerColor == PLAYER_COLOR_RED)  &&
                  (redNeedsToChooseSacrifice === true)  &&
                  (curActor.isDragTarget === true))
         {
            curActor.highlightSprite.visible = true;
         }
         else
         {
            curActor.highlightSprite.visible = false;
         }
      }
      else
      {
         curActor.highlightSprite.visible = false;
      }
   }
}

function updateContainerLimits()
{
   spriteContainerMinX = (appWidth - (curZoom * (worldMaxX - containerStartX)));
   spriteContainerMaxX = (curZoom * (containerStartX - worldMinX));
   spriteContainerMinY = (appHeight - (curZoom * (worldMaxY - containerStartY)));
   spriteContainerMaxY = (curZoom * (containerStartY - worldMinY));

   /*
    * If the system is zoomed out so far that the whole world is visible, it will be
    * locked to the top left because the maximum values will overwrite.
    */

   if (spriteContainer.x < spriteContainerMinX)
   {
      spriteContainer.x = spriteContainerMinX;
   }

   if (spriteContainer.x > spriteContainerMaxX)
   {
      spriteContainer.x = spriteContainerMaxX;
   }

   if (spriteContainer.y < spriteContainerMinY)
   {
      spriteContainer.y = spriteContainerMinY;
   }

   if (spriteContainer.y > spriteContainerMaxY)
   {
      spriteContainer.y = spriteContainerMaxY;
   }

   // Lock the token container to the same position as the sprite container,
   // while keeping it separate so that separate hit tests can work.
   tokenContainer.x = spriteContainer.x;
   tokenContainer.y = spriteContainer.y;
   tokenContainer.scale.x = spriteContainer.scale.x;
   tokenContainer.scale.y = spriteContainer.scale.y;
}

function onMouseDown(curEvent)
{
   isMouseDown = true;
   previousMouseX = curEvent.data.global.x;
   previousMouseY = curEvent.data.global.y;

   let hitObject = null;
   let waitingForRestartConfirm = false;

   if (restartClickedOnce === true)
   {
      waitingForRestartConfirm = true;
   }

   // Check if a UI object was clicked.
   hitObject = mainApp.renderer.plugins.interaction.hitTest(curEvent.data.global, uiContainer);
   if (hitObject != null)
   {
      if (ui_end_turn == hitObject)
      {
         handleTurnEnd();
      }
      else if (ui_pass_turn == hitObject)
      {
         handleTurnPass();
      }
      else if (ui_sacrifice_ccw == hitObject)
      {
         if (curPlayerColor == PLAYER_COLOR_BLUE)
         {
            blueSacrificedDirection = DIRECTION_COUNTERCLOCKWISE;
            blueSacrificesChosen++;
            blueNeedsToChooseSacrifice = false;
         }
         else if (curPlayerColor == PLAYER_COLOR_RED)
         {
            redSacrificedDirection = DIRECTION_COUNTERCLOCKWISE;
            redSacrificesChosen++;
            redNeedsToChooseSacrifice = false;
         }
         else
         {
            // This should never happen.
            // TODO implement black/white player support
            console.log("Unknown player color.");
         }

         ui_sacrifice_ccw.visible = false;
         ui_sacrifice_ccw.interactive = false;
         ui_sacrifice_cw.visible = false;
         ui_sacrifice_cw.interactive = false;

         finishSacrifice();
      }
      else if (ui_sacrifice_cw == hitObject)
      {
         if (curPlayerColor == PLAYER_COLOR_BLUE)
         {
            blueSacrificedDirection = DIRECTION_CLOCKWISE;
            blueSacrificesChosen++;
            blueNeedsToChooseSacrifice = false;
         }
         else if (curPlayerColor == PLAYER_COLOR_RED)
         {
            redSacrificedDirection = DIRECTION_CLOCKWISE;
            redSacrificesChosen++;
            redNeedsToChooseSacrifice = false;
         }
         else
         {
            // This should never happen.
            // TODO implement black/white player support
            console.log("Unknown player color.");
         }

         ui_sacrifice_ccw.visible = false;
         ui_sacrifice_ccw.interactive = false;
         ui_sacrifice_cw.visible = false;
         ui_sacrifice_cw.interactive = false;

         finishSacrifice();
      }
      else if (ui_restart == hitObject)
      {
         if (restartClickedOnce === true)
         {
            startGame();
            waitingForRestartConfirm = false;
            restartClickedOnce = false;
         }
         else
         {
            setCurMsg("Are you sure?  Click Restart again if so.", 0xFFFFFF);
            restartClickedOnce = true;
         }
      }
      else if (ui_ai_takeover == hitObject)
      {
         if (aiPlayerColor == null)
         {
            aiPlayerColor = curPlayerColor;
            ui_ai_takeover.visible = false;
            ui_ai_takeover.interactive = false;

            handleAITurn();
         }
         else
         {
            // This should never happen.
            console.log("The AI has already taken over.");
         }
      }
      else
      {
         // This should never happen.
         console.log("Unknown UI object clicked.");
      }
   }
   else
   {
      let isSelectingSacrifice = false;

      if ((curPlayerColor == PLAYER_COLOR_BLUE) &&
          (blueNeedsToChooseSacrifice === true))
      {
         isSelectingSacrifice = true;
      }

      if ((curPlayerColor == PLAYER_COLOR_RED) &&
          (redNeedsToChooseSacrifice === true))
      {
         isSelectingSacrifice = true;
      }

      // If not selecting a sacrifice, check if a player token was clicked.
      if (isSelectingSacrifice === false)
      {
         hitObject = mainApp.renderer.plugins.interaction.hitTest(curEvent.data.global, tokenContainer);
         if (hitObject != null)
         {
            //
            // Sanity check that this is actually a board game actor.
            // All board game actors have "isLegalTarget" set to either true or false.
            //
            if ("isLegalTarget" in hitObject)
            {
               if (hitObject.isLegalTarget === true)
               {
                  if (hitObject.isClickTarget === true)
                  {
                     // Click if possible.
                     interactWithActor(hitObject, ACTOR_CLICKED);
                  }
                  else if (hitObject.isDragSource === true)
                  {
                     // Otherwise, start dragging if possible.
                     interactWithActor(hitObject, ACTOR_DRAG_START);
                  }
                  else
                  {
                     // Otherwise, the actor does not support clicking or dragging, so ignore the action.
                     hitObject = null;
                  }
               }
               else
               {
                  // Otherwise, the actor is not a legal target, so ignore the action.
                  hitObject = null;
               }
            }
            else
            {
               // This should never happen.
               console.log("Unknown game actor clicked.");
            }
         } // end if (hitObject != null)
      } // end if (isSelectingSacrifice === false)

      if (hitObject == null)
      {
         // Check if a non-token game actor was clicked.
         hitObject = mainApp.renderer.plugins.interaction.hitTest(curEvent.data.global, spriteContainer);
         if (hitObject != null)
         {
            //
            // Sanity check that this is actually a board game actor.
            // All board game actors have "isLegalTarget" set to either true or false.
            //
            if ("isLegalTarget" in hitObject)
            {
               if (hitObject.isLegalTarget === true)
               {
                  if (hitObject.isClickTarget === true)
                  {
                     // Click if possible.
                     interactWithActor(hitObject, ACTOR_CLICKED);
                  }
                  else if (hitObject.isDragSource === true)
                  {
                     // Otherwise, start dragging if possible.
                     interactWithActor(hitObject, ACTOR_DRAG_START);
                  }
                  else if ((curPlayerColor == PLAYER_COLOR_BLUE)  &&
                           (blueNeedsToChooseSacrifice === true)  &&
                           (hitObject.isDragTarget === true))
                  {
                     interactWithActor(hitObject, ACTOR_SACRIFICE);
                  }
                  else if ((curPlayerColor == PLAYER_COLOR_RED)  &&
                           (redNeedsToChooseSacrifice === true)  &&
                           (hitObject.isDragTarget === true))
                  {
                     interactWithActor(hitObject, ACTOR_SACRIFICE);
                  }
                  else
                  {
                     // Otherwise, the actor does not support clicking or dragging, so ignore the action.
                     hitObject = null;
                  }
               }
               else
               {
                  // Otherwise, the actor is not a legal target, so ignore the action.
                  hitObject = null;
               }
            }
            else
            {
               // This should never happen.
               console.log("Unknown game actor clicked.");
            }
         } // end if (hitObject != null)
      } // end handling non-token click
   } // end handling non-UI click

   // If nothing was hit, pan the map.
   if (hitObject == null)
   {
      isPanning = true;
   }

   // If still waiting for a restart confirmation, cancel the restart.
   if (waitingForRestartConfirm === true)
   {
      waitingForRestartConfirm = false;
      restartClickedOnce = false;
      setCurMsg("", 0xFFFFFF);
   }

   // Find legal moves.
   findLegalMoves();

   // Prevent text highlighting etc.
   curEvent.data.originalEvent.preventDefault();
}

function handleAITurn()
{
   let sacrificeNeeded = false;
   let numSacrificesChosen = 0;

   if (isGameOver === false)
   {
      if ((curPlayerColor == PLAYER_COLOR_BLUE) &&
          (blueNeedsToChooseSacrifice === true))
      {
         sacrificeNeeded = true;
         numSacrificesChosen = blueSacrificesChosen;
      }
      else if ((curPlayerColor == PLAYER_COLOR_RED) &&
               (redNeedsToChooseSacrifice === true))
      {
         sacrificeNeeded = true;
         numSacrificesChosen = redSacrificesChosen;
      }
      else
      {
         // Nothing needs done.
      }

      // Check if a sacrifice is needed.
      if (sacrificeNeeded === true)
      {
         if (numSacrificesChosen == 0)
         {
            // In this case, a movement sacrifice needs made.  Make a random choice.
            if (curPlayerColor == PLAYER_COLOR_BLUE)
            {
               if (Math.random() < 0.5)
               {
                  blueSacrificedDirection = DIRECTION_COUNTERCLOCKWISE;
               }
               else
               {
                  blueSacrificedDirection = DIRECTION_CLOCKWISE;
               }
            }
            else if (curPlayerColor == PLAYER_COLOR_RED)
            {
               if (Math.random() < 0.5)
               {
                  redSacrificedDirection = DIRECTION_COUNTERCLOCKWISE;
               }
               else
               {
                  redSacrificedDirection = DIRECTION_CLOCKWISE;
               }
            }
            else
            {
               // This should never happen.
               // TODO implement black/white player support
               console.log("Unknown player color.");
            }

            if (curPlayerColor == PLAYER_COLOR_BLUE)
            {
               blueNeedsToChooseSacrifice = false;
               blueSacrificesChosen++;
            }
            else
            {
               redNeedsToChooseSacrifice = false;
               redSacrificesChosen++;
            }

            ui_sacrifice_cw.visible = false;
            ui_sacrifice_cw.interactive = false;
            ui_sacrifice_ccw.visible = false;
            ui_sacrifice_ccw.interactive = false;
         } // end if (numSacrificesChosen == 0)
         else
         {
            // Otherwise, a space sacrifice needs made.  Make a random choice until a non-good space is chosen.

            let possibleSacrificeCount = 0;
            let actorIndex = 0;

            for(actorIndex = 0; actorIndex < boardGameActors.length; actorIndex++)
            {
               if (boardGameActors[actorIndex].isLegalTarget)
               {
                  aiChoiceOptions[possibleSacrificeCount] = boardGameActors[actorIndex];
                  possibleSacrificeCount++;
               }
            }

            let goodSpaceChosen = true;
            let chosenSacrificeIndex = 0;
            let testSpace = null;

            do
            {
               chosenSacrificeIndex = Math.floor(Math.random() * possibleSacrificeCount);
               testSpace = aiChoiceOptions[chosenSacrificeIndex];

               if ((testSpace != space_kitchen_1) &&
                   (testSpace != space_garden_1) &&
                   (testSpace != space_chapel_1))
               {
                  handleSacrifice(testSpace);
                  goodSpaceChosen = false;
               }
            } while (goodSpaceChosen === true);
         } // end handling space sacrifice
      } // end if (sacrificeNeeded === true)

      // Now, move to a random space until a non-self-sacrificed space is reached.

      let actorIndex = 0;
      let numPossibleMoves = 0;
      let chosenMoveIndex = 0;

      do
      {
         // Start dragging the player token.
         startDragging(monksByColor[aiPlayerColor]);

         // Make a list of all legal moves.
         findLegalMoves();
         numPossibleMoves = 0;
         for(actorIndex = 0; actorIndex < boardGameActors.length; actorIndex++)
         {
            if (boardGameActors[actorIndex].isLegalTarget)
            {
               aiChoiceOptions[numPossibleMoves] = boardGameActors[actorIndex];
               numPossibleMoves++;
            }
         }

         // Pick one at random and move there.
         chosenMoveIndex = Math.floor(Math.random() * numPossibleMoves);
         stopDragging(aiChoiceOptions[chosenMoveIndex]);
      } while(hasPlayerMovedThisTurn === false);

      // Finally, end the turn.
      handleTurnEnd();
   } // end if (isGameOver === false)
}

function handleTurnPass()
{
   if (playersByColor[curPlayerColor].holy > 0)
   {
      playersByColor[curPlayerColor].holy--;
   }
   else
   {
      // This should never happen.
      console.log("Error, no holiness.");
   }

   handleTurnEnd();
}

function onMouseMove(curEvent)
{
   if (isMouseDown === true)
   {
      let xDelta = (curEvent.data.global.x - previousMouseX);
      let yDelta = (curEvent.data.global.y - previousMouseY);

      if (isDragging === true)
      {
         xDelta = (xDelta / curZoom);
         yDelta = (yDelta / curZoom);

         actorBeingDragged.x = (actorBeingDragged.x + xDelta);
         actorBeingDragged.y = (actorBeingDragged.y + yDelta);
      } // end if (isDragging === true)
      else if (isPanning === true)
      {
         let newContainerX = (spriteContainer.x + xDelta);
         let newContainerY = (spriteContainer.y + yDelta);

         if (newContainerX < spriteContainerMinX)
         {
            newContainerX = spriteContainerMinX;
         }

         if (newContainerX > spriteContainerMaxX)
         {
            newContainerX = spriteContainerMaxX;
         }

         if (newContainerY < spriteContainerMinY)
         {
            newContainerY = spriteContainerMinY;
         }

         if (newContainerY > spriteContainerMaxY)
         {
            newContainerY = spriteContainerMaxY;
         }

         spriteContainer.x = newContainerX;
         spriteContainer.y = newContainerY;

         // Lock the token container to the same position as the sprite container,
         // while keeping it separate so that separate hit tests can work.
         tokenContainer.x = spriteContainer.x;
         tokenContainer.y = spriteContainer.y;
      } // end else if (isPanning === true)
      else
      {
         // Nothing needs done.
      }

      previousMouseX = curEvent.data.global.x;
      previousMouseY = curEvent.data.global.y;
   } // end if (isMouseDown === true)

   // Prevent text highlighting etc.
   curEvent.data.originalEvent.preventDefault()
}

function onMouseUp(curEvent)
{
   isMouseDown = false;
   isPanning = false;

   if (isDragging === true)
   {
      let isDragValid = false;

      // Check for a non-token drag target.
      hitObject = mainApp.renderer.plugins.interaction.hitTest(curEvent.data.global, spriteContainer);
      if (hitObject != null)
      {
         //
         // Sanity check that this is actually a board game actor.
         // All board game actors have "isLegalTarget" set to either true or false.
         //
         if ("isLegalTarget" in hitObject)
         {
            if (hitObject.isLegalTarget === true)
            {
               isDragValid = true;
            }
         }
      }

      if (isDragValid === true)
      {
         stopDragging(hitObject);
      }
      else
      {
         cancelDragging();
      }
   }

   // Find legal moves.
   findLegalMoves();

   // Prevent text highlighting etc.
   curEvent.data.originalEvent.preventDefault()
}

function wheelHandler(curWheelEvent)
{
   // TODO adjust limits if needed as game develops
   if (curWheelEvent.deltaY > 0)
   {
      // Zoom out, rounding in case of floating point inaccuracy.
      if (curZoom > 0.55)
      {
         curZoom = (curZoom - 0.25);
      }
   }
   else if (curWheelEvent.deltaY < 0)
   {
      // Zoom in, rounding in case of floating point inaccuracy.
      if (curZoom < 1.20)
      {
         curZoom = (curZoom + 0.25);
      }
   }
   else
   {
      // This should never happen.
   }

   // Scale everything.
   updateSpriteScale();

   // Prevent the webpage from scrolling etc.
   curWheelEvent.preventDefault();
}

function updateSpriteScale()
{
   spriteContainer.scale.x = curZoom;
   spriteContainer.scale.y = curZoom;
   updateContainerLimits();
}

function keyDownHandler(curKeyDownEvent)
{
   let keyHandled = false;

   if (curKeyDownEvent.key == "0")
   {
      resetCamera();
      keyHandled = true;
   }
   else if (curKeyDownEvent.key == " ")
   {
      if (ui_end_turn.visible === true)
      {
         handleTurnEnd();
      }

      keyHandled = true;
   }
   else if ((curKeyDownEvent.key == "p") ||
            (curKeyDownEvent.key == "P"))
   {
      if (ui_pass_turn.visible === true)
      {
         handleTurnPass();
      }

      keyHandled = true;
   }
   else
   {
      // Nothing needs done.
   }

   if (keyHandled === true)
   {
      // Prevent the webpage from scrolling etc.
      curKeyDownEvent.preventDefault();
   }
}

function resetCamera()
{
   spriteContainer.x = containerStartX;
   spriteContainer.y = containerStartY;
   tokenContainer.x = spriteContainer.x;
   tokenContainer.y = spriteContainer.y;

   curZoom = 1.0;

   // Super simple workaround for mobile screens in portrait.
   if ((window.screen.orientation.type == "portrait-primary") ||
       (window.screen.orientation.type == "portrait-secondary"))
   {
      curZoom = 2.0;
   }

   spriteContainer.scale.x = curZoom;
   spriteContainer.scale.y = curZoom;
   tokenContainer.scale.x = spriteContainer.scale.x;
   tokenContainer.scale.y = spriteContainer.scale.y;

   updateContainerLimits();
}

function setCurMsg(msg, tint)
{
   curMsgText.text = msg;
   curMsgText.tint = tint;
}

//
// Game logic.
//


// Starts or restarts a game.
function startGame()
{
   resetCamera();
   updateSpriteScale();

   // TODO support randomly choosing between all ingame players, including black/white
   /*
   let playerColor = PLAYER_COLOR_START;
   for (playerColor = PLAYER_COLOR_START; playerColor <= PLAYER_COLOR_END; playerColor++)
   {
      if ((playersByColor[playerColor] != null) &&
          (playersByColor[playerColor].isInGame === true))
      {
         curPlayerColor = playerColor;

         setCurMsg("New game.  Current turn:    " + COLOR_NAMES[curPlayerColor], COLOR_TINTS[curPlayerColor]);

         break;
      }
   }
   */
   // For this version, randomly pick between the two players.
   if (Math.random() < 0.5)
   {
      curPlayerColor = PLAYER_COLOR_BLUE;
   }
   else
   {
      curPlayerColor = PLAYER_COLOR_RED;
   }

   setCurMsg("New game.   " + COLOR_NAMES[curPlayerColor] + " randomly chosen to move first.", COLOR_TINTS[curPlayerColor]);

   // Reset actor state.

   let actorIndex = 0;
   let curActor = null;

   for(actorIndex = 0; actorIndex < boardGameActors.length; actorIndex++)
   {
      curActor = boardGameActors[actorIndex];

      curActor.linkedSpace = null;
      curActor.linkedActor = null;
      curActor.blockingColor = null;
   }

   // Reset players.
   let resetPlayer = null;
   for (playerColor = PLAYER_COLOR_START; playerColor <= PLAYER_COLOR_END; playerColor++)
   {
      resetPlayer = playersByColor[playerColor];

      resetPlayer.hp = 5;
      resetPlayer.learn = 0;
      resetPlayer.holy = 0;
      resetPlayer.rep = 0;
   }

   aiPlayerColor = null;

   monksByColor[PLAYER_COLOR_BLUE].x = -40;
   monksByColor[PLAYER_COLOR_BLUE].y = 260;

   monksByColor[PLAYER_COLOR_RED].x = 30;
   monksByColor[PLAYER_COLOR_RED].y = 260;

   turnCount = 1;
   isGameOver = false;
   blueSacrificedDirection = null;
   blueSacrifice1 = null;
   blueSacrifice2 = null;
   redSacrificedDirection = null;
   redSacrifice1 = null;
   redSacrifice2 = null;
   blueSacrificesChosen = 0;
   redSacrificesChosen = 0;
   blueNeedsToChooseSacrifice = false;
   redNeedsToChooseSacrifice = false;
   ui_end_turn.visible = false;
   ui_end_turn.interactive = false;
   ui_pass_turn.visible = false;
   ui_pass_turn.interactive = false;
   ui_sacrifice_cw.visible = false;
   ui_sacrifice_cw.interactive = false;
   ui_sacrifice_ccw.visible = false;
   ui_sacrifice_ccw.interactive = false;
   ui_ai_takeover.visible = true;
   ui_ai_takeover.interactive = true;

   sprite_sacrifice_blue_1.visible = false;
   sprite_sacrifice_blue_2.visible = false;
   sprite_sacrifice_red_1.visible = false;
   sprite_sacrifice_red_2.visible = false;

   handleTurnStart()
}

// TODO eventually make this into something that can be used by an AI?
function findLegalMoves()
{
   let actorIndex = 0;
   let curActor = null;
   let canMoveCCW = true;
   let canMoveCW = true;

   if (curPlayerColor == PLAYER_COLOR_BLUE)
   {
      if (blueSacrificedDirection == DIRECTION_COUNTERCLOCKWISE)
      {
         canMoveCCW = false;
      }
      else if (blueSacrificedDirection == DIRECTION_CLOCKWISE)
      {
         canMoveCW = false;
      }
      else
      {
         // Nothing needs done, since no direction has yet been sacrificed.
      }
   }
   else if (curPlayerColor == PLAYER_COLOR_RED)
   {
      if (redSacrificedDirection == DIRECTION_COUNTERCLOCKWISE)
      {
         canMoveCCW = false;
      }
      else if (redSacrificedDirection == DIRECTION_CLOCKWISE)
      {
         canMoveCW = false;
      }
      else
      {
         // Nothing needs done, since no direction has yet been sacrificed.
      }
   }
   else
   {
      // This should never happen.
      // TODO implement black/white player support
      console.log("Unknown player color.");
   }

   if (isGameOver === false)
   {
      // Mark all board game actors as invalid interaction targets.
      for(actorIndex = 0; actorIndex < boardGameActors.length; actorIndex++)
      {
         curActor = boardGameActors[actorIndex];
         curActor.isLegalTarget = false;
      }

      if ((curPlayerColor == PLAYER_COLOR_BLUE) &&
          (blueNeedsToChooseSacrifice === true))
      {
         if (blueSacrificesChosen == 0)
         {
            setCurMsg("Choose a direction to give up.", COLOR_TINTS[curPlayerColor]);
            ui_sacrifice_ccw.visible = true;
            ui_sacrifice_ccw.interactive = true;
            ui_sacrifice_cw.visible = true;
            ui_sacrifice_cw.interactive = true;
         }
         else
         {
            setCurMsg("Choose a space for " + COLOR_NAMES[curPlayerColor] + " to give up.", COLOR_TINTS[curPlayerColor]);

            // In this version, any non-sacrificed drag target is a valid option to give up.
            for(actorIndex = 0; actorIndex < boardGameActors.length; actorIndex++)
            {
               curActor = boardGameActors[actorIndex];
               if ((curActor.blockingColor == null) &&
                     (curActor.isDragTarget))
               {
                  curActor.isLegalTarget = true;
               }
            }
         }
      }
      else if ((curPlayerColor == PLAYER_COLOR_RED) &&
               (redNeedsToChooseSacrifice === true))
      {
         if (redSacrificesChosen == 0)
         {
            setCurMsg("Choose a direction to give up.", COLOR_TINTS[curPlayerColor]);
            ui_sacrifice_ccw.visible = true;
            ui_sacrifice_ccw.interactive = true;
            ui_sacrifice_cw.visible = true;
            ui_sacrifice_cw.interactive = true;
         }
         else
         {
            setCurMsg("Choose a space for " + COLOR_NAMES[curPlayerColor] + " to give up.", COLOR_TINTS[curPlayerColor]);

            // In this version, any non-sacrificed drag target is a valid option to give up.
            for(actorIndex = 0; actorIndex < boardGameActors.length; actorIndex++)
            {
               curActor = boardGameActors[actorIndex];
               if ((curActor.blockingColor == null) &&
                   (curActor.isDragTarget))
               {
                  curActor.isLegalTarget = true;
               }
            }
         }
      }
      else
      {
         if ((isDragging === false) &&
             (hasPlayerMovedThisTurn === false))
         {
            // If not dragging and not already moved, the player's token is an option for interaction.
            monksByColor[curPlayerColor].isLegalTarget = true;
         }

         // Find valid moves based on the player's current space.
         if (isDragging === true)
         {
            // TODO rework this to use list(s) of ordered moves so that black/white players can cause multiple spaces to be skipped?

            let curSpace = monksByColor[curPlayerColor].linkedSpace;
            if (curSpace == null)
            {
               // Allow players to move into the library to start the game.
               if (space_library_1.linkedActor == null)
               {
                  space_library_1.isLegalTarget = true;
               }

               if (space_library_2.linkedActor == null)
               {
                  space_library_2.isLegalTarget = true;
               }
            }
            else if ((curSpace == space_library_1) ||
                     (curSpace == space_library_2))
            {
               if (canMoveCW === true)
               {
                  if (space_kitchen_1.linkedActor == null)
                  {
                     space_kitchen_1.isLegalTarget = true;
                  }
                  else
                  {
                     space_dormitory_1.isLegalTarget = true;
                     space_dormitory_2.isLegalTarget = true;
                  }
               }

               if (canMoveCCW === true)
               {
                  if (space_chapel_1.linkedActor == null)
                  {
                     space_chapel_1.isLegalTarget = true;
                  }

                  if (space_chapel_2A.linkedActor == null)
                  {
                     space_chapel_2A.isLegalTarget = true;
                  }

                  if (space_chapel_2B.linkedActor == null)
                  {
                     space_chapel_2B.isLegalTarget = true;
                  }
               }
            } // end handling library
            else if (curSpace == space_kitchen_1)
            {
               if (canMoveCW === true)
               {
                  if (space_dormitory_1.linkedActor == null)
                  {
                     space_dormitory_1.isLegalTarget = true;
                  }

                  if (space_dormitory_2.linkedActor == null)
                  {
                     space_dormitory_2.isLegalTarget = true;
                  }
               }

               if (canMoveCCW === true)
               {
                  if (space_library_1.linkedActor == null)
                  {
                     space_library_1.isLegalTarget = true;
                  }

                  if (space_library_2.linkedActor == null)
                  {
                     space_library_2.isLegalTarget = true;
                  }
               }
            } // end handling kitchen
            else if ((curSpace == space_dormitory_1) ||
                     (curSpace == space_dormitory_2))
            {
               if (canMoveCW === true)
               {
                  if (space_garden_1.linkedActor == null)
                  {
                     space_garden_1.isLegalTarget = true;
                  }
                  else
                  {
                     space_chapel_1.isLegalTarget = true;
                     space_chapel_2A.isLegalTarget = true;
                     space_chapel_2B.isLegalTarget = true;
                  }
               }

               if (canMoveCCW === true)
               {
                  if (space_kitchen_1.linkedActor == null)
                  {
                     space_kitchen_1.isLegalTarget = true;
                  }
                  else
                  {
                     space_library_1.isLegalTarget = true;
                     space_library_2.isLegalTarget = true;
                  }
               }
            } // end handling dormitory
            else if (curSpace == space_garden_1)
            {
               if (canMoveCW === true)
               {
                  if (space_chapel_1.linkedActor == null)
                  {
                     space_chapel_1.isLegalTarget = true;
                  }

                  if (space_chapel_2A.linkedActor == null)
                  {
                     space_chapel_2A.isLegalTarget = true;
                  }

                  if (space_chapel_2B.linkedActor == null)
                  {
                     space_chapel_2B.isLegalTarget = true;
                  }
               }

               if (canMoveCCW === true)
               {
                  if (space_dormitory_1.linkedActor == null)
                  {
                     space_dormitory_1.isLegalTarget = true;
                  }

                  if (space_dormitory_2.linkedActor == null)
                  {
                     space_dormitory_2.isLegalTarget = true;
                  }
               }
            } // end handling garden
            else if ((curSpace == space_chapel_1)     ||
                     (curSpace == space_chapel_2A)    ||
                     (curSpace == space_chapel_2B))
            {
               if (canMoveCW === true)
               {
                  if (space_library_1.linkedActor == null)
                  {
                     space_library_1.isLegalTarget = true;
                  }

                  if (space_library_2.linkedActor == null)
                  {
                     space_library_2.isLegalTarget = true;
                  }
               }

               if (canMoveCCW === true)
               {
                  if (space_garden_1.linkedActor == null)
                  {
                     space_garden_1.isLegalTarget = true;
                  }
                  else
                  {
                     space_dormitory_1.isLegalTarget = true;
                     space_dormitory_2.isLegalTarget = true;
                  }
               }
            } // end handling both chapel cards
            else
            {
               // This should never happen.
               console.log("Player marker on unknown space.");
            }
         } // end if (isDragging === true)
      } // end if not choosing a color
   } // end if (isGameOver === false)

   // Update highlights.
   updateActorHighlights();
}

function handleTurnStart()
{
   let isSacrificeNeeded = false;

   hasPlayerMovedThisTurn = false;
   restartClickedOnce = false;

   updateSummaryText();

   turnText.text = "Turn " + turnCount;
   if (turnCount <= 5)
   {
      sprite_spring.visible   = true;
      sprite_summer.visible   = false;
      sprite_fall.visible     = false;
      sprite_winter.visible   = false;
   }
   else if (turnCount <= 10)
   {
      sprite_spring.visible   = false;
      sprite_summer.visible   = true;
      sprite_fall.visible     = false;
      sprite_winter.visible   = false;
   }
   else if (turnCount <= 15)
   {
      sprite_spring.visible   = false;
      sprite_summer.visible   = false;
      sprite_fall.visible     = true;
      sprite_winter.visible   = false;
   }
   else if (turnCount <= 20)
   {
      sprite_spring.visible   = false;
      sprite_summer.visible   = false;
      sprite_fall.visible     = false;
      sprite_winter.visible   = true;
   }
   else
   {
      handleGameOver();
   }

   if (isGameOver === false)
   {
      if ((sprite_summer.visible === true) &&
          (blueSacrificesChosen == 0))
      {
         blueNeedsToChooseSacrifice = true;
      }

      if ((sprite_summer.visible === true) &&
          (redSacrificesChosen == 0))
      {
         redNeedsToChooseSacrifice = true;
      }

      if ((sprite_fall.visible === true) &&
          (blueSacrificesChosen == 1))
      {
         blueNeedsToChooseSacrifice = true;
      }

      if ((sprite_fall.visible === true) &&
          (redSacrificesChosen == 1))
      {
         redNeedsToChooseSacrifice = true;
      }

      if ((sprite_winter.visible === true) &&
          (blueSacrificesChosen == 2))
      {
         blueNeedsToChooseSacrifice = true;
      }

      if ((sprite_winter.visible === true) &&
          (redSacrificesChosen == 2))
      {
         redNeedsToChooseSacrifice = true;
      }

      if ((curPlayerColor == PLAYER_COLOR_BLUE) &&
          (blueNeedsToChooseSacrifice === true))
      {
         isSacrificeNeeded = true;
      }

      if ((curPlayerColor == PLAYER_COLOR_RED) &&
          (redNeedsToChooseSacrifice === true))
      {
         isSacrificeNeeded = true;
      }

      if ((isSacrificeNeeded === false) &&
          (playersByColor[curPlayerColor].holy > 0))
      {
         ui_pass_turn.visible = true;
         ui_pass_turn.interactive = true;
      }
      else
      {
         ui_pass_turn.visible = false;
         ui_pass_turn.interactive = false;
      }

      findLegalMoves();

      if (curPlayerColor == aiPlayerColor)
      {
         handleAITurn();
      }
   } // end if (isGameOver === false)
}

function handleTurnEnd()
{
   let playerColor = curPlayerColor;

   do
   {
      playerColor++;
      if (playerColor > PLAYER_COLOR_END)
      {
         playerColor = PLAYER_COLOR_START;
      }
   } while (playersByColor[playerColor].isInGame === false);

   curPlayerColor = playerColor;
   setCurMsg("Current turn:    " + COLOR_NAMES[curPlayerColor], COLOR_TINTS[curPlayerColor]);

   ui_end_turn.visible = false;
   ui_end_turn.interactive = false;

   turnCount++;

   handleTurnStart();
}

function handleGameOver()
{
   isGameOver = true;
   ui_end_turn.visible = false;
   ui_end_turn.interactive = false;
   ui_pass_turn.visible = false;
   ui_pass_turn.interactive = false;

   let bluePlayer = playersByColor[PLAYER_COLOR_BLUE];
   let redPlayer = playersByColor[PLAYER_COLOR_RED];
   let blueTotal = bluePlayer.hp + bluePlayer.learn + bluePlayer.holy + bluePlayer.rep;
   let redTotal = redPlayer.hp + redPlayer.learn + redPlayer.holy + redPlayer.rep;

   if (blueTotal > redTotal)
   {
      setCurMsg("Game over.  BLUE wins " + blueTotal + " to " + redTotal, 0xFFFFFF);
   }
   else if (redTotal > blueTotal)
   {
      setCurMsg("Game over.  RED wins " + redTotal + " to " + blueTotal, 0xFFFFFF);
   }
   else
   {
      setCurMsg("Game over.  It's a tie, " + blueTotal + " to " + redTotal + "!", 0xFFFFFF);
   }
}

function updateSummaryText()
{
   // TODO eventually rework to support black/white players, render as ingame pieces, etc.?
   let bluePlayer = playersByColor[PLAYER_COLOR_BLUE];
   let redPlayer = playersByColor[PLAYER_COLOR_RED];

   blueSummaryText.text = "        HP:  " + bluePlayer.hp + "\n" +
                          "  learning:  " + bluePlayer.learn + "\n" +
                          "  holiness:  " + bluePlayer.holy + "\n" +
                          "reputation:  " + bluePlayer.rep;
   blueSummaryText.tint = COLOR_TINTS[PLAYER_COLOR_BLUE];

   redSummaryText.text  = "        HP:  " + redPlayer.hp + "\n" +
                          "  learning:  " + redPlayer.learn + "\n" +
                          "  holiness:  " + redPlayer.holy + "\n" +
                          "reputation:  " + redPlayer.rep;
   redSummaryText.tint  = COLOR_TINTS[PLAYER_COLOR_RED];
}

function startDragging(actor)
{
   dragStartLocation.x = actor.x;
   dragStartLocation.y = actor.y;

   isDragging = true;
   actorBeingDragged = actor;
}

function cancelDragging()
{
   actorBeingDragged.x = dragStartLocation.x;
   actorBeingDragged.y = dragStartLocation.y;

   isDragging = false;
   actorBeingDragged = null;
}

function stopDragging(validTarget)
{
   // TODO make this more efficient by reworking game actors, sprites, and attachments?

   dragStopLocation.x = validTarget.x;
   dragStopLocation.y = validTarget.y;
   // If the parent is a game sprite, add the parent's position.
   if (validTarget.parent instanceof PIXI.Sprite)
   {
      dragStopLocation.x = (dragStopLocation.x + validTarget.parent.x);
      dragStopLocation.y = (dragStopLocation.y + validTarget.parent.y);
   }

   actorBeingDragged.x = dragStopLocation.x;
   actorBeingDragged.y = dragStopLocation.y;

   // Update links.
   if (actorBeingDragged.linkedSpace != null)
   {
      actorBeingDragged.linkedSpace.linkedActor = null;
   }

   actorBeingDragged.linkedSpace = validTarget;
   validTarget.linkedActor = actorBeingDragged;

   // If the dragged object was the player's token, record this fact.
   if (actorBeingDragged == monksByColor[curPlayerColor])
   {
      hasPlayerMovedThisTurn = true;
      ui_end_turn.visible = true;
      ui_end_turn.interactive = true;
      ui_pass_turn.visible = false;
      ui_pass_turn.interactive = false;
   }

   // Handle the action in the target space.
   interactWithActor(validTarget, ACTOR_DRAG_END);

   // Clean up.
   isDragging = false;
   actorBeingDragged = null;
}

function interactWithActor(target, actionType)
{
   // NOTE:  It is assumed that the actor is interactive, since otherwise this event would not have occurred.
   //        It is also assumed that the interaction is valid, since that should be checked by the calling code.

   if (actionType == ACTOR_DRAG_END)
   {
      performAction(target);
   }
   else
   {
      if (monksByColor[curPlayerColor] == target)
      {
         if (actionType == ACTOR_DRAG_START)
         {
            startDragging(target);
         }
      }
      // TODO add black/white players
      else if (space_library_1 == target)
      {
         if (actionType == ACTOR_SACRIFICE)
         {
            handleSacrifice(space_library_1);
         }
      }
      else if (space_library_2 == target)
      {
         if (actionType == ACTOR_SACRIFICE)
         {
            handleSacrifice(space_library_2);
         }
      }
      else if (space_kitchen_1 == target)
      {
         if (actionType == ACTOR_SACRIFICE)
         {
            handleSacrifice(space_kitchen_1);
         }
      }
      else if (space_dormitory_1 == target)
      {
         if (actionType == ACTOR_SACRIFICE)
         {
            handleSacrifice(space_dormitory_1);
         }
      }
      else if (space_dormitory_2 == target)
      {
         if (actionType == ACTOR_SACRIFICE)
         {
            handleSacrifice(space_dormitory_2);
         }
      }
      else if (space_garden_1 == target)
      {
         if (actionType == ACTOR_SACRIFICE)
         {
            handleSacrifice(space_garden_1);
         }
      }
      else if (space_chapel_1 == target)
      {
         if (actionType == ACTOR_SACRIFICE)
         {
            handleSacrifice(space_chapel_1);
         }
      }
      else if (space_chapel_2A == target)
      {
         if (actionType == ACTOR_SACRIFICE)
         {
            handleSacrifice(space_chapel_2A);
         }
      }
      else if (space_chapel_2B == target)
      {
         if (actionType == ACTOR_SACRIFICE)
         {
            handleSacrifice(space_chapel_2B);
         }
      }
      else
      {
         // This should never happen.
         console.log("Unknown actor interaction.");
      }
   } // end handling non-drag-end actions
}

function performAction(actionSpace)
{
   if (actionSpace.blockingColor != curPlayerColor)
   {
      if (space_library_1 == actionSpace)
      {
         playersByColor[curPlayerColor].learn++;
      }
      else if (space_library_2 == actionSpace)
      {
         playersByColor[curPlayerColor].hp--;
         playersByColor[curPlayerColor].learn++;
         playersByColor[curPlayerColor].learn++;
      }
      else if (space_kitchen_1 == actionSpace)
      {
         playersByColor[curPlayerColor].rep++;
         playersByColor[curPlayerColor].rep++;
      }
      else if (space_dormitory_1 == actionSpace)
      {
         playersByColor[curPlayerColor].hp++;
      }
      else if (space_dormitory_2 == actionSpace)
      {
         playersByColor[curPlayerColor].hp++;
      }
      else if (space_garden_1 == actionSpace)
      {
         playersByColor[curPlayerColor].hp++;
         playersByColor[curPlayerColor].holy++;
      }
      else if (space_chapel_1 == actionSpace)
      {
         playersByColor[curPlayerColor].learn++;
         playersByColor[curPlayerColor].rep++;
      }
      else if (space_chapel_2A == actionSpace)
      {
         playersByColor[curPlayerColor].holy++;
      }
      else if (space_chapel_2B == actionSpace)
      {
         playersByColor[curPlayerColor].learn++;
      }
      else
      {
         // Nothing needs done.
      }

      setCurMsg("Turn complete.", COLOR_TINTS[curPlayerColor]);
   } // end if (actionSpace.blockingColor != curPlayerColor)
   else
   {
      // If the player sacrificed this space, they are allowed to take another action.
      hasPlayerMovedThisTurn = false;
      ui_end_turn.visible = false;
      ui_end_turn.interactive = false;

      if (playersByColor[curPlayerColor].holy > 0)
      {
         ui_pass_turn.visible = true;
         ui_pass_turn.interactive = true;
      }

      setCurMsg("Skipped action, move again.  Current turn:    " + COLOR_NAMES[curPlayerColor], COLOR_TINTS[curPlayerColor]);
   }

   // In case any stats changed, update summary text.
   updateSummaryText();
}

function handleSacrifice(sacrificeSpace)
{
   // TODO clean up this code to make it easier to maintain and extend
   if (curPlayerColor == PLAYER_COLOR_BLUE)
   {
      if (blueSacrificesChosen == 1)
      {
         blueSacrifice1 = sacrificeSpace;
         blueSacrificesChosen++;
         blueNeedsToChooseSacrifice = false;

         sprite_sacrifice_blue_1.x = ((sacrificeSpace.parent.x + sacrificeSpace.x) - 37);
         sprite_sacrifice_blue_1.y = ((sacrificeSpace.parent.y + sacrificeSpace.y) - 12);
         sprite_sacrifice_blue_1.visible = true;
      }
      else if (blueSacrificesChosen == 2)
      {
         blueSacrifice2 = sacrificeSpace;
         blueSacrificesChosen++;
         blueNeedsToChooseSacrifice = false;

         sprite_sacrifice_blue_2.x = ((sacrificeSpace.parent.x + sacrificeSpace.x) - 37);
         sprite_sacrifice_blue_2.y = ((sacrificeSpace.parent.y + sacrificeSpace.y) - 12);
         sprite_sacrifice_blue_2.visible = true;
      }
      else
      {
         // This should never happen.
         console.log("Invalid sacrifice timing.");
      }
   }
   else if (curPlayerColor == PLAYER_COLOR_RED)
   {
      if (redSacrificesChosen == 1)
      {
         redSacrifice1 = sacrificeSpace;
         redSacrificesChosen++;
         redNeedsToChooseSacrifice = false;

         sprite_sacrifice_red_1.x = ((sacrificeSpace.parent.x + sacrificeSpace.x) - 37);
         sprite_sacrifice_red_1.y = ((sacrificeSpace.parent.y + sacrificeSpace.y) + 12);
         sprite_sacrifice_red_1.visible = true;
      }
      else if (redSacrificesChosen == 2)
      {
         redSacrifice2 = sacrificeSpace;
         redSacrificesChosen++;
         redNeedsToChooseSacrifice = false;

         sprite_sacrifice_red_2.x = ((sacrificeSpace.parent.x + sacrificeSpace.x) - 37);
         sprite_sacrifice_red_2.y = ((sacrificeSpace.parent.y + sacrificeSpace.y) + 12);
         sprite_sacrifice_red_2.visible = true;
      }
      else
      {
         // This should never happen.
         console.log("Invalid sacrifice timing.");
      }
   }
   else
   {
      // This should never happen.
      // TODO implement black/white player support
      console.log("Unknown player color.");
   }

   sacrificeSpace.blockingColor = curPlayerColor;

   finishSacrifice();
}

function finishSacrifice(sacrificeSpace)
{
   setCurMsg("Current turn:    " + COLOR_NAMES[curPlayerColor], COLOR_TINTS[curPlayerColor]);

   if (playersByColor[curPlayerColor].holy > 0)
   {
      ui_pass_turn.visible = true;
      ui_pass_turn.interactive = true;
   }
   else
   {
      ui_pass_turn.visible = false;
      ui_pass_turn.interactive = false;
   }

   // Find legal moves.
   findLegalMoves();
}


