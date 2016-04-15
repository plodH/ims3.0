'use strict';

define(function(require, exports, module) {
	
	var templates = require('common/templates'),
		config    = require('common/config'),
		util      = require('common/util');

    var requestUrl  = 'http://192.168.18.166',
        projectName = 'develop',
        layoutId    = -1,
        layout      = null;
		
	exports.init = function() {
		layoutId = Number(util.getHashParameters().id);
        if (!isNaN(layoutId)) {
            var data = JSON.stringify({
                project_name: projectName,
                action: 'getCBLList',
                data: {
                    layout_id: layoutId
                }
            });
            util.ajax('post', requestUrl + '/backend_mgt/v1/layout', data, render);
        } else {
            var defaultLayout = {
                layout_id: -1,
                Name: '新建布局',
                Name_eng: 'new layout',
                Width: '1920',
                Height: '1080',
                BackgroundPic: '',
                BackgroundColor: '#000000',
                TopMargin: '0',
                RightMargin: '0',
                BottomMargin: '0',
                LeftMargin: '0',
                Layout_ControlBoxs: []
            };
            render(defaultLayout);
        }
	};

    function render(json) {
        var widgets = [];
        json.Layout_ControlBoxs.sort(function (a, b) {
            return a.Zorder - b.Zorder;
        });
        json.Layout_ControlBoxs.forEach(function (el, idx, arr) {
            widgets.push({
                name: el.Type_Name
            })
        });
        var property = {
            name: json.Name,
            width: json.Width,
            height: json.Height,
            background_color: json.BackgroundColor,
            background_image: json.BackgroundPic.url
        };

        $('#edit-page-container')
            .html(templates.layout_edit_main({}))
            .removeClass('none');
        $('#layout-editor-wrapper .layout-editor-properties')
            .html(templates.layout_edit_property(property));
        $('#layout-editor-wrapper .layout-editor-widgets')
            .html(templates.layout_edit_widgets({widgets: widgets}));
        if (json.Layout_ControlBoxs.length > 0) {
            var widget = json.Layout_ControlBoxs[0];
            var widgetType = {
                ClockBox: 'clock',
                VideoBox: 'video',
                WebBox: 'html',
                ImageBox: 'image'
            }[widget.Type];
            var widgetProperty = {
                type: widgetType,
                top: widget.Top,
                left: widget.Left,
                width: widget.Width,
                height: widget.Height,
                zIndex: widget.Zorder
            };
            $('#layout-editor-wrapper .layout-editor-widget-properties')
                .html(templates.layout_edit_widget_property(widgetProperty));
        }
        var canvasWidth = $('#layout-editor-wrapper .layout-editor-canvas').width();
        var canvasHeight = $('#layout-editor-wrapper .layout-editor-canvas').height();
        var fitXFactor = canvasWidth / json.Width;
        var fitYFactor = canvasHeight / json.Height;
        var zoomFactor = Math.min(fitXFactor, fitYFactor);
        layout = Layout.createByJSON(json, zoomFactor);
        layout.displayOn($('#layout-editor-wrapper .layout-editor-canvas')[0]);
    }

    // http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
    // http://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
    function createColorIterator() {

        /* accepts parameters
         * h  Object = {h:x, s:y, v:z}
         * OR
         * h, s, v
         */
        function HSVtoRGB(h, s, v) {
            var r, g, b, i, f, p, q, t;
            if (arguments.length === 1) {
                s = h.s, v = h.v, h = h.h;
            }
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);
            switch (i % 6) {
                case 0: r = v, g = t, b = p; break;
                case 1: r = q, g = v, b = p; break;
                case 2: r = p, g = v, b = t; break;
                case 3: r = p, g = q, b = v; break;
                case 4: r = t, g = p, b = v; break;
                case 5: r = v, g = p, b = q; break;
            }
            return {
                r: Math.round(r * 255),
                g: Math.round(g * 255),
                b: Math.round(b * 255)
            };
        }
        
        var h = 0.8, s = 0.5, v = 0.95, a = 0.7;
        
        return function () {
            h += 0.618033988749895;
            h %= 1;
            var rgb = HSVtoRGB(h, s, v);
            return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + a + ')';
        };
        
    }

    function convertWidgetType(type) {
        return {
            ClockBox: 'clock',
            VideoBox: 'video',
            WebBox: 'html',
            ImageBox: 'image'
        }[type];
    }

    function convertWidgetTypeBack(type) {
        return {
            clock: 'ClockBox',
            video: 'VideoBox',
            html: 'WebBox',
            image: 'ImageBox'
        }[type];
    }
    
    function Layout(obj) {
        this.mWidth             = obj.width;
        this.mHeight            = obj.height;
        this.mBackgroundColor   = typeof obj.backgroundColor === 'string' ? obj.backgroundColor : null;
        this.mBackgroundImage   = typeof obj.backgroundImage === 'object' ? obj.backgroundImage : null;
        this.mTopMargin         = typeof obj.topMargin === 'number' ? obj.topMargin : 0;
        this.mBottomMargin      = typeof obj.bottomMargin === 'number' ? obj.bottomMargin : 0;
        this.mLeftMargin        = typeof obj.leftMargin === 'number' ? obj.leftMargin: 0;
        this.mRightMargin       = typeof obj.rightMargin === 'number' ? obj.rightMargin: 0;
        this.mZoomFactor        = typeof obj.zoomFactor === 'number' ? obj.zoomFactor : 1;
        this.mWidgets           = [];
        this.mFocusedWidget     = null;
        this.mFocusMask         = document.createElement('div');
        this.mFocusMask.style.position  = 'absolute';
        this.mColorIterator     = createColorIterator();
        this.mElement           = document.createElement('div');
        this.mElement.appendChild(this.mFocusMask);
        this.mElement.style.position    = 'relative';
        this.mElement.style.backgroundSize = 'contain';
        var self = this;

        function onDrag(ev) {
            var offset = $(self.mElement).offset(),
                rx = ev.pageX - offset.left,
                ry = ev.pageY - offset.top,
                widget = self.mFocusedWidget,
                t = widget.getTop() * self.mZoomFactor,
                l = widget.getLeft() * self.mZoomFactor,
                w = widget.getWidth() * self.mZoomFactor,
                h = widget.getHeight() * self.mZoomFactor;
            switch (dragType) {
                case POSITION_EXTRA.CONTENT:
                    l = l + ry - dragPoint.y;
                    t = t + rx - dragPoint.x;
                    dragPoint = {x: rx, y: ry};
                    break;
                case POSITION_EXTRA.TOP:
                case POSITION_EXTRA.BOTTOM:
                    if (ry < fixedPoint.y) {
                        t = ry;
                        h = fixedPoint.y - ry;
                    } else {
                        t = fixedPoint.y;
                        h = ry - fixedPoint.y;
                    }
                    break;
                case POSITION_EXTRA.RIGHT:
                case POSITION_EXTRA.LEFT:
                    if (rx < fixedPoint.x) {
                        l = rx;
                        w = fixedPoint.x - rx;
                    } else {
                        l = fixedPoint.x;
                        w = rx - fixedPoint.x;
                    }
                    break;
                case POSITION_EXTRA.LEFT_TOP:
                case POSITION_EXTRA.LEFT_BOTTOM:
                case POSITION_EXTRA.RIGHT_TOP:
                case POSITION_EXTRA.RIGHT_BOTTOM:
                    if (fixedPoint.x < rx) {
                        l = fixedPoint.x;
                        w = rx - fixedPoint.x;
                    } else {
                        l = rx;
                        w = rx - fixedPoint.x;
                    }
                    if (fixedPoint.y < ry) {
                        t = fixedPoint.y;
                        h = ry - fixedPoint.y;
                    } else {
                        t = ry;
                        h = fixedPoint.y - ry;
                    }
                    break;
            }
            self.mFocusedWidget.resize({
                top: t / self.mZoomFactor,
                left: l / self.mZoomFactor,
                width: w / self.mZoomFactor,
                height: h / self.mZoomFactor
            });
            widget.requestFocus();
        }

        var POSITION_EXTRA = {
            NONE: 0,
            CONTENT: 1,
            TOP: 2,
            BOTTOM: 3,
            LEFT_TOP: 4,
            LEFT: 5,
            LEFT_BOTTOM: 6,
            RIGHT_TOP: 7,
            RIGHT: 8,
            RIGHT_BOTTOM: 9
        };

        function determineWidget(layout, rx, ry) {
            var l1, l2, t1, t2, r1, r2, b1, b2, widget, borderOffset = 5, posExtra = POSITION_EXTRA.NONE;
            for (var i = layout.mWidgets.length - 1; i >= 0; i--) {
                widget = layout.mWidgets[i];
                l1 = widget.getLeft() * layout.mZoomFactor - borderOffset;
                l2 = widget.getLeft() * layout.mZoomFactor + borderOffset;
                t1 = widget.getTop() * layout.mZoomFactor - borderOffset;
                t2 = widget.getTop() * layout.mZoomFactor + borderOffset;
                r1 = (widget.getLeft() + widget.getWidth()) * layout.mZoomFactor - borderOffset;
                r2 = (widget.getLeft() + widget.getWidth()) * layout.mZoomFactor + borderOffset;
                b1 = (widget.getTop() + widget.getHeight()) * layout.mZoomFactor - borderOffset;
                b2 = (widget.getTop() + widget.getHeight()) * layout.mZoomFactor + borderOffset;
                if (ry < b2 && ry > t1) {
                    if (rx < r1 && rx > l2) {
                        if (ry > t2) {
                            if (ry < b1) {
                                posExtra = POSITION_EXTRA.CONTENT;
                                break;
                            } else {
                                posExtra = POSITION_EXTRA.BOTTOM;
                                break;
                            }
                        } else {
                            posExtra = POSITION_EXTRA.TOP;
                            break;
                        }
                    } else if (rx > l1 && rx <= l2) {
                        if (ry > t2) {
                            if (ry < b1) {
                                posExtra = POSITION_EXTRA.LEFT;
                                break;
                            } else {
                                posExtra = POSITION_EXTRA.LEFT_BOTTOM;
                                break;
                            }
                        } else {
                            posExtra = POSITION_EXTRA.LEFT_TOP;
                            break;
                        }
                    } else if (rx >= r1 && rx < r2) {
                        if (ry > t2) {
                            if (ry < b1) {
                                posExtra = POSITION_EXTRA.RIGHT;
                                break;
                            } else {
                                posExtra = POSITION_EXTRA.RIGHT_BOTTOM;
                                break;
                            }
                        } else {
                            posExtra = POSITION_EXTRA.RIGHT_TOP;
                            break;
                        }
                    }
                }
            }
            return {
                widget: widget,
                posExtra: posExtra
            }
        }

        function onMove(ev) {
            var offset = $(self.mElement).offset(),
                rx = ev.pageX - offset.left,
                ry = ev.pageY - offset.top,
                cursorStyle = null;
            var result = determineWidget(self, rx, ry);
            switch (result.posExtra) {
                case POSITION_EXTRA.LEFT:
                    cursorStyle = 'w-resize';
                    break;
                case POSITION_EXTRA.RIGHT:
                    cursorStyle = 'e-resize';
                    break;
                case POSITION_EXTRA.CONTENT:
                    cursorStyle = 'move';
                    break;
                case POSITION_EXTRA.LEFT_TOP:
                    cursorStyle = 'nw-resize';
                    break;
                case POSITION_EXTRA.TOP:
                    cursorStyle = 'n-resize';
                    break;
                case POSITION_EXTRA.RIGHT_TOP:
                    cursorStyle = 'ne-resize';
                    break;
                case POSITION_EXTRA.LEFT_BOTTOM:
                    cursorStyle = 'sw-resize';
                    break;
                case POSITION_EXTRA.BOTTOM:
                    cursorStyle = 's-resize';
                    break;
                case POSITION_EXTRA.RIGHT_BOTTOM:
                    cursorStyle = 'se-resize';
                    break;
                default:
                    cursorStyle = 'default';
            }
            this.style.cursor = cursorStyle;
        }

        $(this.mElement).mouseenter(function (ev) {
            $(this).on('mousemove', onMove);
            $(this).one('mouseleave', function (evt) {
                $(this).off('mousemove', onMove);
            });
        });

        var dragType = POSITION_EXTRA.NONE, fixedPoint, dragPoint;
        $(this.mElement).mousedown(function (ev) {
            var offset = $(self.mElement).offset(),
                rx = ev.pageX - offset.left,
                ry = ev.pageY - offset.top;
            var result = determineWidget(self, rx, ry);
            dragType = result.posExtra;
            if (result.widget) {
                self.mFocusedWidget = result.widget;
                var t = result.widget.getTop(), l = result.widget.getLeft(), w = result.widget.getWidth(), h = result.widget.getHeight();
                switch (result.posExtra) {
                    case POSITION_EXTRA.LEFT:
                        fixedPoint = {
                            x: (l + w) * self.mZoomFactor,
                            y: t * self.mZoomFactor
                        };
                        break;
                    case POSITION_EXTRA.RIGHT:
                        fixedPoint = {
                            x: l * self.mZoomFactor,
                            y: t * self.mZoomFactor
                        };
                        break;
                    case POSITION_EXTRA.CONTENT:
                        dragPoint = {
                            x: rx * self.mZoomFactor,
                            y: ry * self.mZoomFactor
                        };
                        break;
                    case POSITION_EXTRA.LEFT_TOP:
                        fixedPoint = {
                            x: (l + w) * self.mZoomFactor,
                            y: (t + h) * self.mZoomFactor
                        };
                        break;
                    case POSITION_EXTRA.TOP:
                        fixedPoint = {
                            x: l * self.mZoomFactor,
                            y: (t + h) * self.mZoomFactor
                        };
                        break;
                    case POSITION_EXTRA.RIGHT_TOP:
                        fixedPoint = {
                            x: l * self.mZoomFactor,
                            y: (t + h) * self.mZoomFactor
                        };
                        break;
                    case POSITION_EXTRA.LEFT_BOTTOM:
                        fixedPoint = {
                            x: (l + w) * self.mZoomFactor,
                            y: t * self.mZoomFactor
                        };
                        break;
                    case POSITION_EXTRA.BOTTOM:
                        fixedPoint = {
                            x: l * self.mZoomFactor,
                            y: (t + h) * self.mZoomFactor
                        };
                        break;
                    case POSITION_EXTRA.RIGHT_BOTTOM:
                        fixedPoint = {
                            x: l * self.mZoomFactor,
                            y: t * self.mZoomFactor
                        };
                        break;
                }
                $(this).on('mousemove', onDrag);
                $(this).one('mouseup', function (evt) {
                    $(this).off('mousemove', onDrag);
                });
            }
        });

    }

    Layout.createByJSON = function (json, zoomFactor) {
        var layout = new Layout({
            width:              Number(json.Width),
            height:             Number(json.Height),
            backgroundColor:    json.BackgroundColor,
            backgroundImage:    json.BackgroundPic,
            topMargin:          Number(json.TopMargin),
            bottomMargin:       Number(json.BottomMargin),
            leftMargin:         Number(json.LeftMargin),
            rightMargin:        Number(json.RightMargin),
            zoomFactor:         typeof zoomFactor === 'number' ? zoomFactor : 1
        });                      
        layout.setName(json.Name);
        layout.setNameEng(json.Name_eng);
        layout.setId(json.layout_id);
        var lastWidget = null;
        json.Layout_ControlBoxs.forEach(function (el) {
            var widget = Widget.createByJSON(el);
            layout.addWidget(widget);
            lastWidget = widget;
        });
        if (lastWidget) {
            lastWidget.requestFocus();
        }
        return layout;
    };

    Layout.prototype.exportAsJSON = function () {
        var widgets = [];
        var zIndexCount = 0;
        this.mWidgets.forEach(function (el) {
            var widgetJSON = el.widget.exportAsJSON();
            widgetJSON.Zorder = zIndexCount;
            zIndexCount++;
            widgets.push(widgetJSON);
        });
        var json = {
            Width:          String(this.mWidth),
            Height:         String(this.mHeight),
            BackgroundColor:this.mBackgroundColor,
            BackgroundPic:  this.mBackgroundImage,
            TopMargin:      String(this.mTopMargin),
            BottomMargin:   String(this.mBottomMargin),
            LeftMargin:     String(this.mLeftMargin),
            RightMargin:    String(this.mRightMargin),
            Name:           this.mName,
            Name_Eng:       this.mNameEng,
            layout_id:      this.mId,
            Layout_ControlBoxs: widgets
        };
        return json;
    };

    Layout.prototype.setName = function (name) {
        this.mName = name;
    };

    Layout.prototype.getName = function () {
        return this.mName;
    };

    Layout.prototype.setNameEng = function (nameEng) {
        this.mNameEng = nameEng;
    };

    Layout.prototype.getNameEng = function () {
        return this.mNameEng;
    };

    Layout.prototype.setId = function (id) {
        this.mId = id;
    };

    Layout.prototype.getId = function () {
        return this.mId;
    };

    Layout.prototype.getZoomFactor = function () {
        return this.mZoomFactor;
    };

    Layout.prototype.zoom = function (zoomFactor) {
        this.mZoomFactor = zoomFactor;
        this.onDraw();
    };

    Layout.prototype.displayOn = function (el) {
        this.onDraw();
        el.appendChild(this.mElement);
    };

    Layout.prototype.setBackgroundColor = function (backgroundColor) {
        this.mBackgroundColor = backgroundColor;
        this.mElement.style.backgroundColor = backgroundColor;
    };

    Layout.prototype.setBackgroundImage = function (backgroundImage) {
        this.mBackgroundImage = backgroundImage;
        if (this.mBackgroundImage && this.mBackgroundImage.Type === 'Image') {
            this.mElement.style.backgroundImage = 'url(' + this.mBackgroundImage.URL + ')';
        } else {
            this.mElement.style.backgroundImage = 'none';
        }
    };

    Layout.prototype.addWidget = function (widget) {
        this.mWidgets.push(widget);
        widget.setLayout(this);
        widget.onDraw();
        this.mElement.insertBefore(widget.mElement, this.mFocusMask);
    };

    Layout.prototype.findWidgetById = function (id) {
        var widget = null;
        this.mWidgets.forEach(function (el) {
            if (el.getId() === id) {
                widget = el;
            }
        });
        return widget;
    };

    Layout.prototype.focus = function (widget) {
        this.mFocusedWidget = widget;
        this.mFocusMask.style.top         = widget ? this.mFocusedWidget.getTop() * this.mZoomFactor + 'px' : '0px';
        this.mFocusMask.style.left        = widget ? this.mFocusedWidget.getLeft() * this.mZoomFactor + 'px' : '0px';
        this.mFocusMask.style.width       = widget ? this.mFocusedWidget.getWidth() * this.mZoomFactor + 'px' : '0px';
        this.mFocusMask.style.height      = widget ? this.mFocusedWidget.getHeight() * this.mZoomFactor + 'px' : '0px';
        this.mFocusMask.style.border      = widget ? 'solid 2px #f00' : 'none';
    };

    Layout.prototype.nextColor = function () {
        return this.mColorIterator();
    };

    Layout.prototype.onResize = function () {
        this.mElement.style.width = this.mWidth * this.mZoomFactor + 'px';
        this.mElement.style.height = this.mHeight * this.mZoomFactor + 'px';
    };

    Layout.prototype.onDraw = function () {
        this.mElement.style.width = this.mWidth * this.mZoomFactor + 'px';
        this.mElement.style.height = this.mHeight * this.mZoomFactor + 'px';
        if (this.mBackgroundColor) {
            this.mElement.style.backgroundColor = this.mBackgroundColor;
        }
        if (this.mBackgroundImage && this.mBackgroundImage.Type === 'Image') {
            this.mElement.style.backgroundImage = 'url(' + this.mBackgroundImage.URL + ')';
        }
        this.mWidgets.forEach(function (el) {
            el.onDraw();
        });
        this.mFocusMask.style.top         = this.mFocusedWidget ? this.mFocusedWidget.getTop() * this.mZoomFactor + 'px' : '0px';
        this.mFocusMask.style.left        = this.mFocusedWidget ? this.mFocusedWidget.getLeft() * this.mZoomFactor + 'px' : '0px';
        this.mFocusMask.style.width       = this.mFocusedWidget ? this.mFocusedWidget.getWidth() * this.mZoomFactor + 'px' : '0px';
        this.mFocusMask.style.height      = this.mFocusedWidget ? this.mFocusedWidget.getHeight() * this.mZoomFactor + 'px' : '0px';
        this.mFocusMask.style.border      = this.mFocusedWidget ? 'solid 2px #f00' : 'none';
    };

    Layout.prototype.setWidth = function (width) {
        this.mWidth = width;
        this.onResize();
    };

    Layout.prototype.setHeight = function (height) {
        this.mHeight = height;
        this.onResize();
    };

    /* Widget */
    function Widget(obj) {
        this.mLeft      = obj.left;
        this.mTop       = obj.top;
        this.mWidth     = obj.width;
        this.mHeight    = obj.height;
        this.mId        = obj.id;
        this.mType      = obj.type;
        this.mTypeName  = obj.typeName;
        this.mLayout    = null;
        this.mElement   = document.createElement('div');
    }

    Widget.createByJSON = function (json) {
        var obj = {
            left:   json.Left,
            top:    json.Top,
            width:  json.Width,
            height: json.Height,
            id:     json.ID,
            type:   convertWidgetType(json.Type),
            typeName:   json.Type_Name
        };
        return new Widget(obj);
    };

    Widget.prototype.resize = function (obj) {
        this.mLeft = obj.left;
        this.mTop = obj.top;
        this.mWidth = obj.width;
        this.mHeight = obj.height;
        this.onResize();
    };

    Widget.prototype.exportAsJSON = function () {
        return {
            Left: this.mLeft,
            Top: this.mTop,
            Width: this.mWidth,
            Height: this.mHeight,
            ID: this.mId,
            type: convertWidgetTypeBack(this.mType),
            typeName: this.mTypeName
        };
    };

    Widget.prototype.setLayout = function (layout) {
        this.mLayout = layout;
    };

    Widget.prototype.onResize = function () {
        this.onDraw();
    };

    Widget.prototype.onDraw = function () {
        if (!this.mElement.style.backgroundColor) {
            this.mElement.style.backgroundColor = this.mLayout.nextColor();
        }
        this.mElement.style.position        = 'absolute';
        this.mElement.style.top             = this.mTop    * this.mLayout.getZoomFactor() + 'px';
        this.mElement.style.left            = this.mLeft   * this.mLayout.getZoomFactor() + 'px';
        this.mElement.style.width           = this.mWidth  * this.mLayout.getZoomFactor() + 'px';
        this.mElement.style.height          = this.mHeight * this.mLayout.getZoomFactor() + 'px';
    };

    Widget.prototype.setWidth = function (width) {
        this.mWidth = width;
        this.onResize();
    };

    Widget.prototype.getWidth = function () {
        return this.mWidth;
    };

    Widget.prototype.setHeight = function (height) {
        this.mHeight = height;
        this.onResize();
    };

    Widget.prototype.getHeight = function () {
        return this.mHeight;
    };

    Widget.prototype.setTop = function (top) {
        this.mTop = top;
        this.onResize();
    };

    Widget.prototype.getTop = function () {
        return this.mTop;
    };

    Widget.prototype.setLeft = function (left) {
        this.mLeft = left;
        this.onResize();
    };

    Widget.prototype.getLeft = function () {
        return this.mLeft;
    };

    Widget.prototype.requestFocus = function () {
        if (this.mLayout) {
            this.mLayout.focus(this);
        }
    };

    /* ImageWidget */
    function ImageWidget() {
        Widget.call(this);
    }
    ImageWidget.prototype = Object.create(Widget.prototype);
    ImageWidget.prototype.constructor = ImageWidget;
    ImageWidget.prototype.onDraw = function () {

    };

    /* VideoWidget */
    function VideoWidget() {
        Widget.call(this);
    }
    VideoWidget.prototype = Object.create(Widget.prototype);
    VideoWidget.prototype.constructor = VideoWidget;
    VideoWidget.prototype.onDraw = function () {

    };

    /* AudioWidget */
    function AudioWidget() {
        Widget.call(this);
    }
    AudioWidget.prototype = Object.create(Widget.prototype);
    AudioWidget.prototype.constructor = AudioWidget;
    AudioWidget.prototype.onDraw = function () {

    };

    /* HTMLWidget */
    function HTMLWidget() {
        Widget.call(this);
    }
    HTMLWidget.prototype = Object.create(Widget.prototype);
    HTMLWidget.prototype.constructor = HTMLWidget;
    HTMLWidget.prototype.onDraw = function () {

    };



});
