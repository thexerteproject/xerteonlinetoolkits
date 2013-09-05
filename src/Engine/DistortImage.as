import flash.display.BitmapData;
 
class DistortImage
{

    public var texture:BitmapData;
								//target		//this		//defaults
    public function DistortImage( mc: MovieClip, ptexture, vseg: Number, hseg: Number )
    {
        _mc = mc;
		
        texture = new BitmapData( ptexture._width, ptexture._height, true );
        texture.draw( ptexture );

		_vseg = 3;
        _hseg = 3;

        _w = texture.width ;
        _h = texture.height;

        _aMcs   = new Array();
        _p   = new Array();
        _tri    = new Array();

        __init();
    }
 
    function setTransform( x0:Number , y0:Number , x1:Number , y1:Number , x2:Number , y2:Number , x3:Number , y3:Number ): Void
    {
        var w:Number = _w;
        var h:Number = _h;
        var dx30:Number = x3 - x0;
        var dy30:Number = y3 - y0;
        var dx21:Number = x2 - x1;
        var dy21:Number = y2 - y1;
        var l:Number = _p.length;
        while( --l> -1 )
        {
            var point:Object = _p[ l ];
            var gx = ( point.x - _xMin ) / w;
            var gy = ( point.y - _yMin ) / h;
            var bx = x0 + gy * ( dx30 );
            var by = y0 + gy * ( dy30 );
 
            point.sx = bx + gx * ( ( x1 + gy * ( dx21 ) ) - bx );
            point.sy = by + gx * ( ( y1 + gy * ( dy21 ) ) - by );
        }
        __render();
    }
    
    /////////////////////////
    ///  PRIVATE METHODS  ///
    /////////////////////////
    private function __init( Void ): Void
    {
        _p = new Array();
        _tri = new Array();
        var ix:Number, iy:Number;
        var w2: Number = _w / 2;
        var h2: Number = _h / 2;
        _xMin = _yMin = 0;
        _xMax = _w; _yMax = _h;
        _hsLen = _w / ( _hseg + 1 );
        _vsLen = _h / ( _vseg + 1 );
        var x:Number, y:Number;
        var p0:Object, p1:Object, p2:Object;
        
        // -- we create the points
        for ( ix = 0 ; ix <_hseg + 2 ; ix++ )
        {
            for ( iy = 0 ; iy <_vseg + 2 ; iy++ )
            {
                x = ix * _hsLen;
                y = iy * _vsLen;
                _p.push( { x: x, y: y, sx: x, sy: y } );
            }
        }
        // -- we create the triangles
        for ( ix = 0 ; ix <_vseg + 1 ; ix++ )
        {
            for ( iy = 0 ; iy <_hseg + 1 ; iy++ )
            {
                p0 = _p[ iy + ix * ( _hseg + 2 ) ];
                p1 = _p[ iy + ix * ( _hseg + 2 ) + 1 ];
                p2 = _p[ iy + ( ix + 1 ) * ( _hseg + 2 ) ];
                __addTriangle( p0, p1, p2 );
                // --
                p0 = _p[ iy + ( ix + 1 ) * ( _vseg + 2 ) + 1 ];
                p1 = _p[ iy + ( ix + 1 ) * ( _vseg + 2 ) ];
                p2 = _p[ iy + ix * ( _vseg + 2 ) + 1 ];
                __addTriangle( p0, p1, p2 );
            }
        }
        __render();
    }
    
    private function __addTriangle( p0:Object, p1:Object, p2:Object ):Void
    {
        var u0:Number, v0:Number, u1:Number, v1:Number, u2:Number, v2:Number;
        var tMat:Object = {};

        u0 = p0.x; v0 = p0.y;
        u1 = p1.x; v1 = p1.y;
        u2 = p2.x; v2 = p2.y;
        tMat.tx = -v0*(_w / (v1 - v0));
        tMat.ty = -u0*(_h / (u2 - u0));
        tMat.a = tMat.d = 0;
        tMat.b = _h / (u2 - u0);
        tMat.c = _w / (v1 - v0);
   
        _tri.push( [p0, p1, p2, tMat] );    
    }
 
    private function __render( Void ): Void
    {
        var vertices: Array;
        var p0, p1, p2:Object;
        var x0:Number, y0:Number;
        var ih:Number = 1/_h, iw:Number = 1/_w;

		var c:MovieClip = _mc; c.clear();
        var a:Array;
        var sM = {};
        var tM = {};

        var l:Number = _tri.length;
        while( --l> -1 )
        {
            a   = _tri[ l ];
            p0  = a[0];
            p1  = a[1];
            p2  = a[2];
            tM = a[3];
            // --
            sM.a = ( p1.sx - ( x0 = p0.sx ) ) * iw;
            sM.b = ( p1.sy - ( y0 = p0.sy ) ) * iw;
            sM.c = ( p2.sx - x0 ) * ih;
            sM.d = ( p2.sy - y0 ) * ih;
            sM.tx = x0;
            sM.ty = y0;
            // --
            sM = __concat( sM, tM );
            c.beginBitmapFill( texture, sM, false, false );
            c.moveTo( x0, y0 );
            c.lineTo( p1.sx, p1.sy );
            c.lineTo( p2.sx, p2.sy );
            c.endFill();
        }
    }
 
    private function __concat( m1, m2 ):Object 
    {   
        var mat = {};
        mat.a  = m1.c * m2.b;
        mat.b  = m1.d * m2.b;
        mat.c  = m1.a * m2.c;
        mat.d  = m1.b * m2.c;
        mat.tx = m1.a * m2.tx + m1.c * m2.ty + m1.tx;
        mat.ty = m1.b * m2.tx + m1.d * m2.ty + m1.ty;   
        return mat;
    }
    
    /////////////////////////
    /// PRIVATE PROPERTIES //
    /////////////////////////
    private var _mc:MovieClip;
    private var _w:Number;
    private var _h:Number;
    private var _xMin:Number, _xMax:Number, _yMin:Number, _yMax:Number;
    // -- picture segmentation properties
    private var _hseg:Number;
    private var _vseg:Number;
    private var _hsLen:Number;
    private var _vsLen:Number;
    // -- arrays of differents datas types
    private var _p:Array;
    private var _tri:Array;
    private var _aMcs:Array;
    
} 

