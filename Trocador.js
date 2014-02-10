var Trocador = function(opt){
    $.extend(true, this, opt);
    this.start();
};

Trocador.prototype.start = function(){
    var _this = this;
    this.ui = $("#trocador");
    var pantalla_login = new PantallaLogin({
        alIngresarUsuario:function(nombre_mercader){
            _this.usuario = new Mercader({
                nombre: nombre_mercader
            });
            _this.pantalla_mercado = new PantallaMercado({usuario: _this.usuario });
            _this.pantalla_mercado.mostrar();
            vx.pedirMensajes({
                filtro: new FiltroXEjemplo({
                    para:_this.usuario.nombre
                }),
                callback: function(mensaje){
                    //recibo todos los mensajes que son para mi, este filtro debería simplificar todas las respuestas particulares
                }
            });  
        }
    });
    
    vx.start({verbose:true});
    
//    vx.conectarPorHTTP({
//        //url:'http://router-vortex.herokuapp.com',
//        url:'http://localhost:3000',
//        intervalo_polling: 50
//    });    
    vx.conectarPorWebSockets({
        url:'https://router-vortex.herokuapp.com' 
        //url:'http://localhost:3000'
    });   
    

};