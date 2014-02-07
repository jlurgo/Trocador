var PanelDeMandosBT = function(opt){
    $.extend(true, this, opt);
    this.start();
};

PanelDeMandosBT.prototype.start = function(){
    var _this = this;
    this.ui = $("#panel_control_bt");
    this.txt_status = this.ui.find("#status"); 
    
    vx.start({verbose:true});
    
    vx.conectarPorHTTP({
        url:'http://router-vortex.herokuapp.com',
        intervalo_polling: 200
    });    
    
//    vx.conectarPorWebSockets({
//        url:'https://router-vortex.herokuapp.com'
//        //url:'http://localhost:3000'
//    });
    
    vx.conectarPorBluetoothConArduino({
        mac: '20:13:06:14:05:97',
        alConectar:function(){
            _this.txt_status.text('conectado a 20:13:06:14:05:97');
        },
        onErrorAlConectar:function(){
            _this.txt_status.text('error al conectar a 20:13:06:14:05:97');
        }
    })
    
    this.panelKnobs = this.ui.find("#knobs");
    
    var knob0 = new VortexKnob({id:0});
    knob0.dibujarEn(this.panelKnobs);
    
    var knob1 = new VortexKnob({id:1});
    knob1.dibujarEn(this.panelKnobs);
    
};