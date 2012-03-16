(function () {
    var ImageData = function (width, height) {
        this.width  = width  || 10;
        this.height = height || 10;
        numPixels = this.width * this.height;
        this.data = new Uint8Array(numPixels * 4);
    };

    var CanvasGradient = function () {};

    CanvasGradient.prototype.addColorStop = function (offset, color) {
        return undefined;
    };

    var CanvasPattern = function (image, repetitionStyle) {
        this.image = image;
        this.repetitionStyle = repetitionStyle;
    };

    var TextMetrics = function (ctx, text) {
        // quick and dirty style
        var fontSize = parseInt(ctx.font),
            chars = text.split().length;
        this.width = fontSize * chars;
    }

    var CanvasRenderingContext2D = function (canvas) {
        this.canvas                     = canvas;
        this.fillStyle                  = "rgb(0,0,0)";
        this.font                       = "10px sans-serif";
        this.globalAlpha                = 1.0;
        this.globalCompositionOperation = "source-over";
        this.lineCap                    = "butt";
        this.lineJoin                   = "miter";
        this.lineWidth                  = 1.0;
        this.miterLimit                 = 10;
        this.textAlign                  = "start";
        this.textBaseLine               = "alphabetic";
        this.shadowBlur                 = 0;
        this.shadowColor                = "rgba(0,0,0,0)";
        this.shadowOffsetX              = 0;
        this.shadowOffsetY              = 0;
        this.strokeStyle                = "rgb(0,0,0)";

        this.__width          = this.canvas.width;
        this.__height         = this.canvas.height;
        this.__imageData      = null; // don't do this until we need it, it's a memory hog.
                                      // new ImageData(this.__width, this.__height);
        this.__curX           = 0;
        this.__curY           = 0;
        this.__openSubpath    = true;
        this.__initTime       = new Date();
        this.__lastUpdateTime = null;
        this.__lastFillTime   = null;
        this.__updateCount    = 0;
        this.__fillCount      = 0;
    };

    CanvasRenderingContext2D.prototype.__update = function () {
        var args = Array.prototype.slice.call(arguments);
        this.__lastUpdateTime = new Date();
        this.__updateCount++;
    }
    CanvasRenderingContext2D.prototype.__fill = function () {
        var args = Array.prototype.slice.call(arguments);
        this.__lastFillTime = new Date();
        this.__fillCount++;
    }

    // Stub out the real methods. I'm explicitly returning undefined
    // in cases where the API calls for void return, so as to be clear
    // about the intent. This is a simple sub-set of the API focused
    // on operations for images. TODO: implement transforms and state.
    CanvasRenderingContext2D.prototype.arc = function (x, y, radius, startAngle, endAngle, counterClockwise) {
        this.__openSubpath    = true;
        return undefined;
    };
    CanvasRenderingContext2D.prototype.arcTo = function (x1, y1, x2, y2, radius) {
        this.__openSubpath    = true;
        this.__curX = x2;
        this.__curY = y2;
        return undefined;
    };
    CanvasRenderingContext2D.prototype.beginPath = function () {
        this.__openSubpath = true;
        return undefined;
    };
    CanvasRenderingContext2D.prototype.bezierCurveTo = function (cpX1, cpY1, cpX2, cpY2, x, y) {
        this.__openSubpath    = true;
        this.__curX = x;
        this.__curY = y;
        return undefined;
    };
    CanvasRenderingContext2D.prototype.clearRect = function () {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.clip = function () {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.closePath = function () {
        this.__openSubpath = false;
        return undefined;
    };
    CanvasRenderingContext2D.prototype.createImageData = function () {
        var args = Array.prototype.slice.call(arguments);

        if (args[0].hasOwnProperty('data') && typeof args[0].data !== 'undefined') {
            return new ImageData(args[0].data.length, 1);
        } else if (typeof args[0] === 'number' && typeof args[1] === 'number') {
            return new ImageData(args[0], args[1]);
        } else {
            throw new Error("Invalid arguments. createImageData() takes 1 or 2 args.");
        }
    };
    CanvasRenderingContext2D.prototype.createLinearGradient = function (xStart, yStart, xEnd, yEnd) {
        return new CanvasGradient();
    };
    CanvasRenderingContext2D.prototype.createPattern = function (image, repetitionStyle) {
        return new CanvasPattern(image, repetitionStyle);
    };
    CanvasRenderingContext2D.prototype.createRadialGradient = function (xStart, yStart, radiusStart, xEnd, yEnd, radiusEnd) {
        return new CanvasGradient();
    };
    CanvasRenderingContext2D.prototype.drawImage = function () {
        switch(arguments.length) {
        case 3:
            return CanvasRenderingContext2D.prototype.__drawImage3.apply(this, arguments);
        case 5:
            return CanvasRenderingContext2D.prototype.__drawImage5.apply(this, arguments);
        case 9:
            return CanvasRenderingContext2D.prototype.__drawImage9.apply(this, arguments);
        default:
            throw new Error("Invalid number of arguments. drawImage() takes, 3, 5, or 9 args.");
        }
    };

    // All that contortion and I don't do anything with it. I'm stubbing
    // this out in case I want to at some point.
    CanvasRenderingContext2D.prototype.__drawImage3 = function (image, dx, dy) {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.__drawImage5 = function (image, dx, dy, dw, dh) {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.__drawImage9 = function (image, sx, sy, sw, sh, dx, dy, dw, dh) {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.fill = function () {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.fillRect = function (x, y, width, height) {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, max) {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.getImageData = function (x, y, w, h) {
        if (arguments.length !== 4)
            throw new Error("getImageData requires 4 arguments.");

        var offset = x * y * 4 + x * 4,
            numPixels = w * h * 4 + w * 4,
            imageData = this.__imageData || new ImageData(this.__width,  this.__height),
            retImageData = new ImageData(w, h);

        retImageData.data = imageData.data.slice(offset, offset + numPixels);
        return retImageData;
    };
    CanvasRenderingContext2D.prototype.isPointPath = function (x, y) {
        return true;
    };
    CanvasRenderingContext2D.prototype.lineTo = function (x, y) {
        this.__openSubpath    = true;
        this.__curX = x;
        this.__curY = y;
        return undefined;
    };
    CanvasRenderingContext2D.prototype.measureText = function (text) {
        return new TextMetrics(this, text);
    };
    CanvasRenderingContext2D.prototype.moveTo = function (x, y) {
        this.__curX = x;
        this.__curY = y;
        return undefined;
    };
    CanvasRenderingContext2D.prototype.putImageData = function (insertData, dx, dy, sx, sy, sw, sh) {
        if (arguments.length !== 7)
            throw new Error("putImageData requires 7 arguments")

        var imageData = this.__imageData || new ImageData(this.__width,  this.__height),
            startAt   = dx * dy * 4 + dx + 4,
            fromData,
            fromOffset = sx * sy * 4 + sx * 4,
            fromNumPixels = sw * sh * 4 + sw * 4,
            endAt = imageData.length - 1,
            howMany;

        if (typeof fromOffset === 'number' && typeof fromNumPixels === 'number') {
            fromData = insertData.data.slice(fromOffset, fromOffset + fromNumPixels);
        } else {
            fromData = insertData.data;
        }

        startAt + fromData.length > endAt ? howMany = endAt - startAt : howMany = startAt + fromData.length;
        imageData.data.splice(startAt, howMany, fromData);

        return undefined;
    };
    CanvasRenderingContext2D.prototype.quadraticCurveTo = function (cpX, cpY, x, y) {
        this.__curX = x;
        this.__curY = y;
        return undefined;
    };
    CanvasRenderingContext2D.prototype.rect = function (x, y, width, height) {
        this.__curX = x;
        this.__curY = y;
        return undefined;
    };
    CanvasRenderingContext2D.prototype.restore = function () {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.rotate = function (angle) {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.save = function () {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.scale = function (sx, sy) {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.setTransform = function (a, b, c, d, e, f) {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.stroke = function () {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.strokeRect = function (x, y, width, height) {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.strokeText = function (text, x, y, max) {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.transform = function (a, b, c, d, e, f) {
        return undefined;
    };
    CanvasRenderingContext2D.prototype.translate = function (dx, dy) {
        return undefined;
    };

    var Canvas = function () {
        this.width  = 10; // API default is 300 x 150, but that makes
        this.height = 10; // our ImageData a memory hog.
    };

    Canvas.prototype.getContext = function (cxtType) {
        return new CanvasRenderingContext2D(this);
    };

    Canvas.prototype.toDataURL = function () {
        var buf = new Buffer("Say hello to my little friend.");
        return "data:text/plain;base64," + buf.toString('base64');
    };

    module.exports = Canvas;
})();
