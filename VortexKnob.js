var VortexKnob = function(opt){
    $.extend(true, this, opt);
    this.start();
};

VortexKnob.prototype.start = function(){
    var _this = this;
    this.ui = $("#plantillas").find("#knob").clone();
    
    this.envioDesHabilitado = false;
        
    vx.pedirMensajes({
        filtro: new FiltroXEjemplo({
            tipoDeMensaje:"control_servo",
            id_servo: this.id
        }),
        callback: function(mensaje){
            _this.envioDesHabilitado = true;
            _this.ui.val(mensaje.angulo).trigger('change');
            _this.envioDesHabilitado = false;
        }
    });                                        
};

VortexKnob.prototype.dibujarEn = function(un_panel){
    var _this = this;
    un_panel.append(this.ui);
    this.ui.knob({max:175, 
        angleArc:180, 
        angleOffset:90, 
        skin:"tron",
        linecap:"round",
        change:function(valor){  
            if(_this.envioDesHabilitado) return;
            vx.enviarMensaje({
                tipoDeMensaje:'control_servo',
                id_servo:_this.id,
                angulo:valor
            });
        }
    });    
};