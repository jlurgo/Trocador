/*
Vortex by Vortex Group is licensed under a Creative Commons Reconocimiento 3.0 Unported License.
To view a copy of this licence, visit: http://creativecommons.org/licenses/by/3.0/
Project URL: https://sourceforge.net/p/vortexnet
*/

var NodoConectorSocket = function(socket){
    this.socket = socket;
    this.start();
};

NodoConectorSocket.prototype.start = function(){
    var _this = this;
    this.socket.on('mensaje_vortex', function (mensaje) {
        //console.log("conector recibe mensaje por socket:", mensaje);
        _this.receptor.recibirMensaje(mensaje);
    });
};

NodoConectorSocket.prototype.conectarCon = function(un_nodo){
    this.receptor = un_nodo;
};

NodoConectorSocket.prototype.recibirMensaje = function(mensaje){  
    //console.log("conector envia mensaje por socket:", mensaje);
    this.socket.emit('mensaje_vortex', mensaje);
};

if(typeof(require) != "undefined"){
    exports.clase = NodoConectorSocket;
}