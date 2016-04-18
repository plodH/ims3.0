'use strict';

define(function (require, exports, module) {

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

        var h = 0.8, s = 0.5, v = 0.95, a = 0.9;

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
            ImageBox: 'image',
            AudioBox: 'audio'
        }[type];
    }

    function convertWidgetTypeBack(type) {
        return {
            clock: 'ClockBox',
            video: 'VideoBox',
            html: 'WebBox',
            image: 'ImageBox',
            audio: 'AudioBox'
        }[type];
    }

    function onResize(widget, resizeType, zoomFactor, resizePoint, currentPoint) {
        var rx = currentPoint.x,
            ry = currentPoint.y,
            nx = resizePoint.x,
            ny = resizePoint.y,
            t = widget.getTop() * zoomFactor,
            l = widget.getLeft() * zoomFactor,
            w = widget.getWidth() * zoomFactor,
            h = widget.getHeight() * zoomFactor;
        switch (resizeType) {
            case WIDGET_AREA.TOP:
            case WIDGET_AREA.BOTTOM:
                if (ry < ny) {
                    t = ry;
                    h = ny - ry;
                } else {
                    t = ny;
                    h = ry - ny;
                }
                break;
            case WIDGET_AREA.RIGHT:
            case WIDGET_AREA.LEFT:
                if (rx < nx) {
                    l = rx;
                    w = nx - rx;
                } else {
                    l = nx;
                    w = rx - nx;
                }
                break;
            case WIDGET_AREA.LEFT_TOP:
            case WIDGET_AREA.LEFT_BOTTOM:
            case WIDGET_AREA.RIGHT_TOP:
            case WIDGET_AREA.RIGHT_BOTTOM:
                if (nx < rx) {
                    l = nx;
                    w = rx - nx;
                } else {
                    l = rx;
                    w = nx - rx;
                }
                if (ny < ry) {
                    t = ny;
                    h = ry - ny;
                } else {
                    t = ry;
                    h = ny - ry;
                }
                break;
            default:
                return;
        }
        widget.resize({
            top: t / zoomFactor,
            left: l / zoomFactor,
            width: w / zoomFactor,
            height: h / zoomFactor
        });
        widget.notifyDataChanged();
    }

    function updateCursor(area) {
        var cursorStyle;
        switch (area) {
            case WIDGET_AREA.LEFT:
                cursorStyle = 'w-resize';
                break;
            case WIDGET_AREA.RIGHT:
                cursorStyle = 'e-resize';
                break;
            case WIDGET_AREA.CONTENT:
                cursorStyle = 'move';
                break;
            case WIDGET_AREA.LEFT_TOP:
                cursorStyle = 'nw-resize';
                break;
            case WIDGET_AREA.TOP:
                cursorStyle = 'n-resize';
                break;
            case WIDGET_AREA.RIGHT_TOP:
                cursorStyle = 'ne-resize';
                break;
            case WIDGET_AREA.LEFT_BOTTOM:
                cursorStyle = 'sw-resize';
                break;
            case WIDGET_AREA.BOTTOM:
                cursorStyle = 's-resize';
                break;
            case WIDGET_AREA.RIGHT_BOTTOM:
                cursorStyle = 'se-resize';
                break;
            default:
                cursorStyle = 'default';
        }
        return cursorStyle;
    }

    function beginResize(widget, area, zoomFactor) {
        var t = widget.getTop(),
            l = widget.getLeft(),
            w = widget.getWidth(),
            h = widget.getHeight(),
            x, y;
        switch (area) {
            case WIDGET_AREA.LEFT:
                x = l + w;
                y = t;
                break;
            case WIDGET_AREA.RIGHT:
                x = l;
                y = t;
                break;
            case WIDGET_AREA.LEFT_TOP:
                x = l + w;
                y = t + h;
                break;
            case WIDGET_AREA.TOP:
                x = l;
                y = t + h;
                break;
            case WIDGET_AREA.RIGHT_TOP:
                x = l;
                y = t + h;
                break;
            case WIDGET_AREA.LEFT_BOTTOM:
                x = l + w;
                y = t;
                break;
            case WIDGET_AREA.BOTTOM:
                x = l;
                y = t;
                break;
            case WIDGET_AREA.RIGHT_BOTTOM:
                x = l;
                y = t;
                break;
        }
        return {
            x: x * zoomFactor,
            y: y * zoomFactor
        };
    }

    var WIDGET_AREA = {
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
    var RULER_WIDTH = 0;
    var MIN_CANVAS_SCALE = 0.9;
    var WIDGET_BORDER_TOLERATE = 5;

    function LayoutEditor(layoutJSON, viewWidth, viewHeight) {

        this.mTopRuler          = document.createElement('div');
        this.mLeftRuler         = document.createElement('div');
        this.mCanvas            = document.createElement('div');
        this.mCanvasContainer   = document.createElement('div');
        this.mCanvasContainer.appendChild(this.mCanvas);
        this.mElement           = document.createElement('div');
        this.mElement.appendChild(this.mTopRuler);
        this.mElement.appendChild(this.mLeftRuler);
        this.mElement.appendChild(this.mCanvasContainer);
        
        var lw          = Number(layoutJSON.Width);
        var lh          = Number(layoutJSON.Height);
        var zx          = (viewWidth - RULER_WIDTH) / lw;
        var zy          = (viewHeight - RULER_WIDTH) / lh;
        var zoomFactor  = Math.min(zx, zy) * MIN_CANVAS_SCALE;
        var ccvw        = viewWidth - RULER_WIDTH;
        var ccvh        = viewHeight - RULER_WIDTH;
        
        var layout = new Layout({
            width:              lw,
            height:             lh,
            backgroundColor:    layoutJSON.BackgroundColor,
            backgroundImage:    layoutJSON.BackgroundPic,
            topMargin:          Number(layoutJSON.TopMargin),
            bottomMargin:       Number(layoutJSON.BottomMargin),
            leftMargin:         Number(layoutJSON.LeftMargin),
            rightMargin:        Number(layoutJSON.RightMargin),
            id:                 layoutJSON.layout_id,
            name:               layoutJSON.Name,
            nameEng:            layoutJSON.Name_eng,
            widgets:            layoutJSON.Layout_ControlBoxs,
            element:            this.mCanvas,
            context:            this
        });

        this.mCcvw          = ccvw;
        this.mCcvh          = ccvh;
        this.mViewWidth      = viewWidth;
        this.mViewHeight     = viewHeight;
        this.mLayout        = layout;
        this.mZoomFactor    = zoomFactor;

        this.mTopRuler.style.height =
            this.mLeftRuler.style.width =
                this.mCanvasContainer.style.top =
                    this.mCanvasContainer.style.left =
                        RULER_WIDTH + 'px';
        this.mCanvasContainer.style.position = 'absolute';
        this.mCanvasContainer.style.overflow = 'auto';
        this.mCanvas.style.position = 'absolute';

        var resizeType, resizeWidget, resizePoint, isResizing = false, self = this;

        $(this.mCanvas).mouseenter(function (ev) {
            $(this).on('mousemove', function (evt) {
                var offset = $(this).offset(),
                    rx = evt.pageX - offset.left,
                    ry = evt.pageY - offset.top;
                var result = self.mLayout.findWidgetAndAreaByOffset(rx, ry);
                if (isResizing) {
                    if (resizeType === WIDGET_AREA.CONTENT) {
                        var offsetX = (rx - resizePoint.x) / self.mZoomFactor,
                            offsetY = (ry - resizePoint.y) / self.mZoomFactor;
                        resizePoint.x = rx;
                        resizePoint.y = ry;
                        resizeWidget.translateTo(
                            resizeWidget.getLeft() + offsetX,
                            resizeWidget.getTop() + offsetY
                        );
                    } else {
                        onResize(resizeWidget, resizeType, self.mZoomFactor, resizePoint, {x: rx, y: ry});
                    }
                    resizeWidget.requestFocus();
                }
                this.style.cursor = updateCursor(result.area);
                this.lastChild.title = (result.widget && result.widget.mTypeName) || '';
                return false;
            });
            $(this).one('mouseleave', function (evt) {
                $(this).off('mousemove');
                isResizing = false;
                return false;
            });
            return false;
        });

        $(this.mCanvas).mousedown(function (ev) {
            var offset = $(this).offset(),
                rx = ev.pageX - offset.left,
                ry = ev.pageY - offset.top;
            var result = self.mLayout.findWidgetAndAreaByOffset(rx, ry);
            resizeType = result.area;
            if (resizeType === WIDGET_AREA.CONTENT) {
                resizePoint = {x: rx, y: ry};
                resizeWidget = result.widget;
                resizeWidget.requestFocus();
                isResizing = true;
            } else if (resizeType !== WIDGET_AREA.NONE) {
                resizeWidget = result.widget;
                resizePoint = beginResize(resizeWidget, resizeType, self.mZoomFactor);
                resizeWidget.requestFocus();
                isResizing = true;
            }
            $(this).one('mouseup', function (evt) {
                isResizing = false;
                return false;
            });
            return false;
        });

    }
    
    LayoutEditor.prototype.onDraw = function () {
        this.mElement.style.width = this.mViewWidth + 'px';
        this.mElement.style.height = this.mViewHeight + 'px';
        this.mTopRuler.style.width = this.mViewWidth + 'px';
        this.mLeftRuler.style.height = this.mViewHeight - RULER_WIDTH + 'px';
        this.mCanvasContainer.style.height = this.mCcvh + 'px';
        this.mCanvasContainer.style.width = this.mCcvw + 'px';
        this.mCanvas.style.top = (this.mCcvh - this.mLayout.mHeight * this.mZoomFactor) / 2 + 'px';
        this.mCanvas.style.left = (this.mCcvw - this.mLayout.mWidth * this.mZoomFactor) / 2 + 'px';

        this.mLayout.onDraw();
    };

    LayoutEditor.prototype.resize = function (viewWidth, viewHeight) {
        var zx          = (viewWidth - RULER_WIDTH) / this.mLayout.mWidth;
        var zy          = (viewHeight - RULER_WIDTH) / this.mLayout.mHeight;
        this.mZoomFactor= Math.min(zx, zy) * MIN_CANVAS_SCALE;
        this.mCcvw      = viewWidth - RULER_WIDTH;
        this.mCcvh      = viewHeight - RULER_WIDTH;
    };

    LayoutEditor.prototype.onResize = function () {

        this.onDraw();
    };
    
    LayoutEditor.prototype.zoom = function (zoomFactor) {
        // var x = zoomFactor * this.mLayout.mWidth / this.mCcvw,
        //     y = zoomFactor * this.mLayout.mHeight / this.mCcvh;
        // if (Math.max(x, y) < MIN_CANVAS_SCALE) {
        //     return false;
        // }
        var t = zoomFactor / this.mZoomFactor;
        this.mCcvw *= t;
        this.mCcvh *= t;
        this.mZoomFactor = zoomFactor;
        this.onDraw();
    };
    
    LayoutEditor.prototype.attachToDOM  = function (el) {
        this.onDraw();
        el.appendChild(this.mElement);
    };
    
    LayoutEditor.prototype.getLayout = function () {
        return this.mLayout;
    };
    
    LayoutEditor.prototype.getZoomFactor = function () {
        return this.mZoomFactor;  
    };

    function Layout(obj) {
        this.mWidth             = obj.width;
        this.mHeight            = obj.height;
        this.mBackgroundColor   = obj.backgroundColor;
        this.mBackgroundImage   = obj.backgroundImage;
        this.mTopMargin         = obj.topMargin;
        this.mBottomMargin      = obj.bottomMargin;
        this.mLeftMargin        = obj.leftMargin;
        this.mRightMargin       = obj.rightMargin;
        this.mId                = obj.id;
        this.mName              = obj.name;
        this.mNameEng           = obj.nameEng;
        this.mElement           = obj.element;
        this.mContext           = obj.context;

        this.mWidgets           = [];
        this.mColorIterator     = createColorIterator();
        
        this.mFocusMask                     = document.createElement('div');
        this.mFocusMask.style.position      = 'absolute';
        this.mContent                       = document.createElement('div');
        this.mContent.appendChild(this.mFocusMask);
        this.mContent.style.position        = 'absolute';
        this.mContent.style.top             = this.mTopMargin + 'px';
        this.mContent.style.left            = this.mLeftMargin + 'px';
        this.mContent.style.backgroundSize  = 'contain';
        this.mElement.appendChild(this.mContent);
        this.mElement.style.boxShadow = '0 5px 10px 0 rgba(0, 0, 0, 0.26)';
        this.mDataChangedListener = null;
        this.mWidgetListChangedListener = null;
        this.mFocusedWidgetChangedListener = null;

        /************* focus on last widget ***************/
        var lastWidget  = null, self = this;
        obj.widgets.forEach(function (el) {
            var widget  = Widget.createByJSON(el, self.mContext, self);
            self.addWidget(widget);
            lastWidget  = widget;
        });
        this.mFocusedWidget = lastWidget;
        /**************** end of this section **************/
        
    }

    Layout.prototype.exportToJSON = function () {
        var widgets = [];
        var zIndexCount = 0;
        this.mWidgets.forEach(function (el) {
            var widgetJSON = el.widget.exportToJSON();
            widgetJSON.Zorder = zIndexCount;
            zIndexCount++;
            widgets.push(widgetJSON);
        });
        return {
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
    };

    Layout.prototype.onFocusedWidgetChanged = function (listener) {
        this.mFocusedWidgetChangedListener = listener;
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

    Layout.prototype.setBackgroundColor = function (backgroundColor) {
        this.mBackgroundColor = backgroundColor;
        this.mContent.style.backgroundColor = backgroundColor;
    };

    Layout.prototype.setBackgroundImage = function (backgroundImage) {
        this.mBackgroundImage = backgroundImage;
        if (this.mBackgroundImage && this.mBackgroundImage.Type === 'Image') {
            this.mContent.style.backgroundImage = 'url(' + this.mBackgroundImage.URL + ')';
        } else {
            this.mContent.style.backgroundImage = 'none';
        }
    };

    Layout.prototype.notifyDataChanged = function () {
        this.mDataChangedListener && this.mDataChangedListener(this);
    };

    Layout.prototype.onDataChanged = function (dataChangedListener) {
        this.mDataChangedListener = dataChangedListener;
    };

    Layout.prototype.addWidget = function (widget) {
        this.mWidgets.push(widget);
        widget.onDraw();
        this.mContent.insertBefore(widget.mElement, this.mFocusMask);
    };

    Layout.prototype.deleteWidget = function (widget) {
        var wIndex = -1;
        for (var i = 0; i < this.mWidgets.length; i++) {
            if (widget === this.mWidgets[i]) {
                wIndex = i;
                break;
            }
        }
        if (wIndex !== -1) {
            this.mContent.removeChild(widget.mElement);
            if (wIndex !== 0) {
                this.mWidgets.splice(wIndex, 1);
                this.mWidgets[wIndex - 1].requestFocus();
            } else if (this.mWidgets.length > 1) {
                this.mWidgets.splice(wIndex, 1);
                this.mWidgets[wIndex + 1].requestFocus();
            }
            this.notifyWidgetListChanged();
        }
    };

    Layout.prototype.move = function (widget, step) {
        var wIndex = -1;
        for (var i = 0; i < this.mWidgets.length; i++) {
            if (widget === this.mWidgets[i]) {
                wIndex = i;
                break;
            }
        }
        if (wIndex !== -1 && step !== 0 && (wIndex + step < this.mWidgets.length && wIndex + step >= 0)) {
            this.mWidgets.splice(wIndex, 1);
            this.mWidgets.splice(wIndex + step, 0, widget);
            var el = this.mContent.childNodes[wIndex];
            this.mContent.removeChild(el);
            this.mContent.insertBefore(el, this.mContent.childNodes[wIndex + step]);
        }
    };

    Layout.prototype.onWidgetListChanged = function (listener) {
        this.mWidgetListChangedListener = listener;
    };

    Layout.prototype.notifyWidgetListChanged = function () {
        this.mWidgetListChangedListener && this.mWidgetListChangedListener(this.exportToJSON());
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
    
    Layout.prototype.findWidgetAndAreaByOffset = function (rx, ry) {

        function findAreaByOffset(widget, zoomFactor, rx, ry) {
            var l1, l2, t1, t2, r1, r2, b1, b2;
            l1 = widget.getLeft()   * zoomFactor - WIDGET_BORDER_TOLERATE;
            l2 = widget.getLeft()   * zoomFactor + WIDGET_BORDER_TOLERATE;
            t1 = widget.getTop()    * zoomFactor - WIDGET_BORDER_TOLERATE;
            t2 = widget.getTop()    * zoomFactor + WIDGET_BORDER_TOLERATE;
            r1 = (widget.getLeft()  + widget.getWidth())    * zoomFactor - WIDGET_BORDER_TOLERATE;
            r2 = (widget.getLeft()  + widget.getWidth())    * zoomFactor + WIDGET_BORDER_TOLERATE;
            b1 = (widget.getTop()   + widget.getHeight())   * zoomFactor - WIDGET_BORDER_TOLERATE;
            b2 = (widget.getTop()   + widget.getHeight())   * zoomFactor + WIDGET_BORDER_TOLERATE;
            if (ry < b2 && ry > t1) {
                if (rx < r1 && rx > l2) {
                    if (ry > t2) {
                        if (ry < b1) {
                            return WIDGET_AREA.CONTENT;
                        } else {
                            return WIDGET_AREA.BOTTOM;
                        }
                    } else {
                        return WIDGET_AREA.TOP;
                    }
                } else if (rx > l1 && rx <= l2) {
                    if (ry > t2) {
                        if (ry < b1) {
                            return WIDGET_AREA.LEFT;
                        } else {
                            return WIDGET_AREA.LEFT_BOTTOM;
                        }
                    } else {
                        return WIDGET_AREA.LEFT_TOP;
                    }
                } else if (rx >= r1 && rx < r2) {
                    if (ry > t2) {
                        if (ry < b1) {
                            return WIDGET_AREA.RIGHT;
                        } else {
                            return WIDGET_AREA.RIGHT_BOTTOM;
                        }
                    } else {
                        return WIDGET_AREA.RIGHT_TOP;
                    }
                }
            }
            return WIDGET_AREA.NONE;
        }

        if (!this.mFocusedWidget) {
            return {
                widget: null,
                area: WIDGET_AREA.NONE
            }
        }
        var widget = this.mFocusedWidget, area = findAreaByOffset(this.mFocusedWidget, this.mContext.getZoomFactor(), rx, ry);
        for (var i = this.mWidgets.length - 1; i >= 0 && area === WIDGET_AREA.NONE; i--) {
            widget = this.mWidgets[i];
            if (this.mFocusedWidget === widget) {
                continue;
            }
            area = findAreaByOffset(widget, this.mContext.getZoomFactor(), rx, ry);
        }

        return {
            widget: widget,
            area: area
        }

    };

    Layout.prototype.getFocusedWidget = function () {
        return this.mFocusedWidget;
    };

    Layout.prototype.focus = function (widget) {
        this.mFocusedWidget = widget;
        var zoomFactor = this.mContext.getZoomFactor();
        this.mFocusMask.style.top         = widget ? this.mFocusedWidget.getTop()   * zoomFactor + 'px' : '0px';
        this.mFocusMask.style.left        = widget ? this.mFocusedWidget.getLeft()  * zoomFactor + 'px' : '0px';
        this.mFocusMask.style.width       = widget ? this.mFocusedWidget.getWidth() * zoomFactor + 'px' : '0px';
        this.mFocusMask.style.height      = widget ? this.mFocusedWidget.getHeight()    * zoomFactor + 'px' : '0px';
        this.mFocusMask.style.border      = widget ? 'solid 2px #f00' : 'none';
        this.mFocusedWidgetChangedListener && this.mFocusedWidgetChangedListener();
    };

    Layout.prototype.nextColor = function () {
        return this.mColorIterator();
    };

    Layout.prototype.onResize = function () {
        /*
        var zoomFactor = this.mContext.getZoomFactor();
        this.mElement.style.width  = this.mWidth  * zoomFactor + 'px';
        this.mElement.style.height = this.mHeight * zoomFactor + 'px';
        this.mContent.style.width  = (this.mWidth - this.mLeftMargin - this.mRightMargin) * zoomFactor + 'px';
        this.mContent.style.height = (this.mHeight - this.mTopMargin - this.mBottomMargin) * zoomFactor + 'px';
        */
        this.mContext.onResize();
    };

    Layout.prototype.onDraw = function () {
        var zoomFactor = this.mContext.getZoomFactor();
        this.mElement.style.width  = this.mWidth  * zoomFactor + 'px';
        this.mElement.style.height = this.mHeight * zoomFactor + 'px';
        this.mContent.style.width  = (this.mWidth - this.mLeftMargin - this.mRightMargin) * zoomFactor + 'px';
        this.mContent.style.height = (this.mHeight - this.mTopMargin - this.mBottomMargin) * zoomFactor + 'px';
        this.setBackgroundColor(this.mBackgroundColor);
        this.setBackgroundImage(this.mBackgroundImage);
        this.mWidgets.forEach(function (el) {
            el.onDraw();
        });
        this.focus(this.mFocusedWidget);
    };

    Layout.prototype.setWidth = function (width) {
        if (!this.trySetWidth(width)) {
            return false;
        }
        this.mWidth = width;
        this.onResize();
        return true;
    };

    Layout.prototype.getWidth = function () {
        return this.mWidth;
    };

    Layout.prototype.getHeight = function () {
        return this.mHeight;
    };

    Layout.prototype.trySetWidth = function (width) {
        if (typeof width !== 'number' || width < 0) {
            return false;
        }
        for ( var i = 0; i < this.mWidgets.length; i++) {
            if (this.mWidgets[i].getLeft() + this.mWidgets[i].getWidth() > width) {
                return false;
            }
        }
        return true;
    };

    Layout.prototype.getBackgroundColor = function () {
        return this.mBackgroundColor;
    };

    Layout.prototype.setHeight = function (height) {
        if (!this.trySetHeight(height)) {
            return false;
        }
        this.mHeight = height;
        this.onResize();
        return true;
    };

    Layout.prototype.trySetHeight = function (height) {
        if (typeof height !== 'number' || height < 0) {
            return false;
        }
        for ( var i = 0; i < this.mWidgets.length; i++) {
            if (this.mWidgets[i].getTop() + this.mWidgets[i].getHeight() > height) {
                return false;
            }
        }
        return true;
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
        this.mContext   = obj.context;
        this.mLayout    = obj.layout;
        this.mElement   = document.createElement('div');
    }

    Widget.createByJSON = function (json, context, layout) {
        var obj = {
            left:   json.Left,
            top:    json.Top,
            width:  json.Width,
            height: json.Height,
            id:     json.ID,
            type:   convertWidgetType(json.Type),
            typeName:   json.Type_Name,
            context: context,
            layout: layout
        };
        switch (obj.type) {
            case 'image':
                return new ImageWidget(obj);
            case 'html':
                return new HTMLWidget(obj);
            case 'clock':
                return new ClockWidget(obj);
            case 'audio':
                return new AudioWidget(obj);
            case 'video':
                return new VideoWidget(obj);
        }
    };
    
    Widget.prototype.translateTo = function(x, y) {
        if (x < 0 ||
            y < 0 ||
            x + this.mWidth > this.mLayout.mWidth - this.mLayout.mLeftMargin - this.mLayout.mRightMargin ||
            y + this.mHeight > this.mLayout.mHeight - this.mLayout.mTopMargin - this.mLayout.mBottomMargin
        ) {
            return;
        }
        this.mLeft  = x;
        this.mTop   = y;
        this.onResize();
    };

    Widget.prototype.notifyDataChanged = function () {
        this.mLayout.notifyDataChanged();
    };

    Widget.prototype.resize = function (obj) {
        this.mLeft  = obj.left;
        this.mTop   = obj.top;
        this.mWidth = obj.width;
        this.mHeight = obj.height;
        this.onResize();
    };

    Widget.prototype.exportToJSON = function () {
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

    Widget.prototype.onResize = function () {
        this.onDraw();
    };

    Widget.prototype.onDraw = function () {
        if (!this.mElement.style.backgroundColor) {
            this.mElement.style.backgroundColor = this.mLayout.nextColor();
        }
        this.mElement.style.position        = 'absolute';
        this.mElement.style.top             = this.mTop    * this.mContext.getZoomFactor() + 'px';
        this.mElement.style.left            = this.mLeft   * this.mContext.getZoomFactor() + 'px';
        this.mElement.style.width           = this.mWidth  * this.mContext.getZoomFactor() + 'px';
        this.mElement.style.height          = this.mHeight * this.mContext.getZoomFactor() + 'px';
    };

    Widget.prototype.setWidth = function (width) {
        if (!this.trySetWidth(width)) {
            return false;
        }
        this.mWidth = width;
        this.onResize();
        return true;
    };

    Widget.prototype.trySetWidth = function (width) {
        if (typeof width !== 'number' || width < 0 || width + this.mLeft > this.mLayout.getWidth()) {
            return false;
        }
        return true;
    };

    Widget.prototype.getWidth = function () {
        return this.mWidth;
    };

    Widget.prototype.trySetHeight = function (height) {
        if (typeof height !== 'number' || height < 0 || height + this.mTop > this.mLayout.getHeight()) {
            return false;
        }
        return true;
    };

    Widget.prototype.setHeight = function (height) {
        if (!this.trySetHeight(height)) {
            return false;
        }
        this.mHeight = height;
        this.onResize();
        return true;
    };

    Widget.prototype.getHeight = function () {
        return this.mHeight;
    };
    
    Widget.prototype.trySetTop = function (top) {
          if (typeof top !== 'number' || top < 0 || top + this.mHeight > this.mLayout.getHeight()) {
              return false;
          }
        return true;
    };

    Widget.prototype.setTop = function (top) {
        if (!this.trySetTop(top)) {
            return false;
        }
        this.mTop = top;
        this.onResize();
        return true;
    };

    Widget.prototype.getTop = function () {
        return this.mTop;
    };
    
    Widget.prototype.trySetLeft = function (left) {
        if (typeof left !== 'number' || left < 0 || left + this.mWidth > this.mLayout.getWidth()) {
            return false;
        }
        return true;
    };

    Widget.prototype.setLeft = function (left) {
        if (!this.trySetLeft(left)) {
            return false;
        }
        this.mLeft = left;
        this.onResize();
        return true;
    };

    Widget.prototype.getLeft = function () {
        return this.mLeft;
    };

    Widget.prototype.requestFocus = function () {
        this.mLayout.focus(this);
    };

    /* ImageWidget */
    function ImageWidget() {
        Widget.apply(this, arguments);
    }
    ImageWidget.prototype = Object.create(Widget.prototype);
    ImageWidget.prototype.constructor = ImageWidget;
    ImageWidget.prototype.onDraw = function () {
        Widget.prototype.onDraw.call(this);
    };

    /* VideoWidget */
    function VideoWidget() {
        Widget.apply(this, arguments);
    }
    VideoWidget.prototype = Object.create(Widget.prototype);
    VideoWidget.prototype.constructor = VideoWidget;
    VideoWidget.prototype.onDraw = function () {
        Widget.prototype.onDraw.call(this);
    };

    /* AudioWidget */
    function AudioWidget() {
        Widget.apply(this, arguments);
    }
    AudioWidget.prototype = Object.create(Widget.prototype);
    AudioWidget.prototype.constructor = AudioWidget;
    AudioWidget.prototype.onDraw = function () {
        Widget.prototype.onDraw.call(this);
    };

    /* HTMLWidget */
    function HTMLWidget() {
        Widget.apply(this, arguments);
    }
    HTMLWidget.prototype = Object.create(Widget.prototype);
    HTMLWidget.prototype.constructor = HTMLWidget;
    HTMLWidget.prototype.onDraw = function () {
        Widget.prototype.onDraw.call(this);
    };

    /* ClockWidget */
    function ClockWidget() {
        Widget.apply(this, arguments);
    }
    ClockWidget.prototype = Object.create(Widget.prototype);
    ClockWidget.prototype.constructor = ClockWidget;
    ClockWidget.prototype.onDraw = function () {
        Widget.prototype.onDraw.call(this);
    };

    exports.LayoutEditor = LayoutEditor;
    exports.Layout = Layout;
    exports.Widget = Widget;

});

