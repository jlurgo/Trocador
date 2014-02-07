/*
Vortex by Vortex Group is licensed under a Creative Commons Reconocimiento 3.0 Unported License.
To view a copy of this licence, visit: http://creativecommons.org/licenses/by/3.0/
Project URL: https://sourceforge.net/p/vortexnet
*/


if(typeof(require) != "undefined"){
    exports.GeneradorDeIdMensaje = require("./GeneradorDeIdMensaje").clase;
    exports.ClonadorDeObjetos = require("./ClonadorDeObjetos").clase;
    exports.PataConectora = require("./PataConectora").clase;
    exports.FiltrosYTransformaciones = require("./FiltrosYTransformaciones");
    exports.NodoMultiplexor = require("./NodoMultiplexor").clase;
    exports.NodoRouter = require("./NodoRouter").clase;
    exports.NodoPortalBidi = require("./NodoPortalBidi").clase;
    exports.NodoPortalBidiMonoFiltro = require("./NodoPortalBidiMonoFiltro").clase;
    exports.NodoConectorSocket = require("./NodoConectorSocket").clase;    
    exports.NodoSesionHttpServer = require("./NodoSesionHttpServer").clase;    
}

var Vortex = Vx = vX = vx = {
    start:function(opt){
        $.extend(true, this, opt);
        this.router = new NodoRouter();
        this.portales = [];
    },
    conectarPorHTTP: function(p){
        this.adaptadorHTTP = new NodoClienteHTTP(p.url, p.intervalo_polling, this.verbose, p.mensajes_por_paquete);
        this.router.conectarBidireccionalmenteCon(this.adaptadorHTTP);
    },
    conectarPorWebSockets: function(p){
        var socket = io.connect(p.url);    
        this.adaptadorWebSockets = new NodoConectorSocket(socket);    
        this.router.conectarBidireccionalmenteCon(this.adaptadorWebSockets);
    },
    conectarPorBluetoothConArduino: function(p){
        this.adaptadorArduino = new NodoAdaptadorBluetoothArduino(p);
        this.router.conectarBidireccionalmenteCon(this.adaptadorArduino);
    },
    pedirMensajes: function(p){
        var portal = new NodoPortalBidi();
        portal.conectarBidireccionalmenteCon(this.router);        
        portal.pedirMensajes(p.filtro, p.callback); 
        this.portales.push(portal);
        return this.portales.length - 1; //devuelvo id del portal/pedido para que el cliente pueda darlos de baja
    },
    enviarMensaje:function(mensaje){
        this.router.recibirMensaje(mensaje);
    }    
};

if(typeof(require) != "undefined"){
    exports.Vortex = Vortex;
}