
var Mercader = function(opt){
    $.extend(true, this, opt);
    this.start();
};

Mercader.prototype.start = function(){
    var _this = this;
    
    vx.pedirMensajes({
        filtro: new FiltroXEjemplo({
            tipoDeMensaje:"trocador.pedidoDeIntegrantesDelMercado"
        }),
        callback: function(mensaje){
            vx.enviarMensaje({
                tipoDeMensaje: "trocador.avisoDePresenciaEnElMercado",
                nombre_mercader: _this.nombre,
                para: mensaje.pide
            });
        }
    });  
    
    vx.pedirMensajes({
        filtro: new FiltroXEjemplo({
            tipoDeMensaje:"trocador.pedidoDeInventario",
            mercader: this.nombre
        }),
        callback: function(mensaje){
            vx.enviarMensaje({
                tipoDeMensaje: "trocador.inventario",
                inventario: _this.inventario,
                mercader: _this.nombre,
                para: mensaje.pide
            });
        }
    });  
    
    vx.pedirMensajes({
        filtro: new FiltroXEjemplo({
            tipoDeMensaje:"trocador.agregarProducto",
            mercader: this.nombre
        }),
        callback: function(mensaje){
            _this.inventario.push(mensaje.producto);
            vx.enviarMensaje({
                tipoDeMensaje: "trocador.nuevoProducto",
                mercader: _this.nombre,
                producto: mensaje.producto
            });
        }
    });  
    vx.enviarMensaje({
        tipoDeMensaje: "trocador.avisoDeIngresoAlMercado",
        nombre_mercader: this.nombre
    });
};

Mercader.prototype.informarPresencia = function(){
    vx.enviarMensaje({
        tipoDeMensaje: "trocador.avisoDePresenciaEnElMercado",
        nombre_mercader: this.nombre
    });
};