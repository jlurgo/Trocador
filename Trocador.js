Trocador = {
    start : function(){
        var _this = this;
        this.ui = $("#trocador");
        var pantalla_login = new PantallaLogin({
            alIngresarUsuario:function(nombre_mercader){
                _this.usuario = {
                    nombre: nombre_mercader,
                    inventario: []
                };
                _this.alIngresarAlMercado();
            }
        });

        vx.start({verbose:true});

        vx.conectarPorHTTP({
            url:'http://router-vortex.herokuapp.com',
            //url:'http://localhost:3000',
            intervalo_polling: 50
        });    
//        vx.conectarPorWebSockets({
//            //url:'https://router-vortex.herokuapp.com' 
//            url:'http://localhost:3000'
//        });   
    },
    
    alIngresarAlMercado:function(){
        var _this = this;
        this.mercaderes = [];
        this.maximo_id_de_producto
            
        this.panelInventarioUsuario = new PanelInventario();
        this.panelInventarioUsuario.dibujarEn(this.ui.find("#panel_propio #inventario"));
        this.panelInventarioUsuario.setMercader(this.usuario);
        this.panelInventarioUsuario.alCambiarLosProductosDelTrueque = function(){
            _this.mercaderSeleccionado.trueque.mio = _this.panelInventarioUsuario.productosEnTrueque;
            _this.btnProponerTrueque.show();            
            _this.btnAceptarTrueque.hide();            
        };
        
        this.panelInventarioDelOtro = new PanelInventario();
        this.panelInventarioDelOtro.dibujarEn(this.ui.find("#panel_ajeno #inventario"));
        this.panelInventarioDelOtro.alCambiarLosProductosDelTrueque = function(){
            _this.mercaderSeleccionado.trueque.suyo = _this.panelInventarioDelOtro.productosEnTrueque;
            _this.btnProponerTrueque.show();            
            _this.btnAceptarTrueque.hide();
        };

        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDeIngreso"
            }),
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.nombre) return;
                _this.agregarMercader(mensaje.de, mensaje.inventario);
                vx.enviarMensaje({
                    tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                    de: _this.usuario.nombre,
                    para: mensaje.de,
                    inventario: _this.usuario.inventario
                });
            }
        });  

        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                para: this.usuario.nombre
            }),
            callback: function(mensaje){
                _this.agregarMercader(mensaje.de, mensaje.inventario);
            }
        });
        
        vx.enviarMensaje({
            tipoDeMensaje: "trocador.avisoDeIngreso",
            de: this.usuario.nombre,
            inventario:this.usuario.inventario
        });
        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDeNuevoProducto"
            }),
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.nombre) return;
                var mercader = _.findWhere(_this.mercaderes, {nombre: mensaje.de});
                mercader.inventario.push(mensaje.producto);
                _this.panelInventarioDelOtro.actualizar();
            }
        });  
        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDeBajaDeProducto"
            }),
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.nombre) return;
                var mercader = _.findWhere(_this.mercaderes, {nombre: mensaje.de});
                
                mercader.inventario = $.grep(mercader.inventario, function(prod){
                    return mensaje.producto.id != prod.id;
                });
                _this.panelInventarioDelOtro.setMercader(_this.mercaderSeleccionado);
            }
        });  
        
        this.pantalla_mercado =  $("#pantalla_mercado");
        this.barraDatosUsuario = this.pantalla_mercado.find("#panel_propio .datos_usuario");
        this.barraDatosUsuario.text(this.usuario.nombre);

        SelectorDeMercaderes.start({
            mercaderes: this.mercaderes,
            alSeleccionarMercader: function(mercader){           
                _this.mercaderSeleccionado = mercader;
                _this.panelInventarioDelOtro.setMercader(mercader);
                _this.panelInventarioDelOtro.setItemsTrueque(mercader.trueque.suyo);
                _this.panelInventarioUsuario.setItemsTrueque(mercader.trueque.mio);
                if(mercader.trueque.envioPropuesta == "el") {_this.btnProponerTrueque.hide();
                                                             _this.btnAceptarTrueque.show();}
                if(mercader.trueque.envioPropuesta == "ninguno") {_this.btnProponerTrueque.show();
                                                             _this.btnAceptarTrueque.hide();}
                if(mercader.trueque.envioPropuesta == "yo") {_this.btnProponerTrueque.hide();
                                                             _this.btnAceptarTrueque.hide();}
            }
        });

        this.btnAgregarProducto = this.pantalla_mercado.find("#btn_add_producto");
        this.txt_nombre_producto_add = this.pantalla_mercado.find("#txt_nombre_producto_add");
        this.btnAgregarProducto.click(function(){
            _this.agregarProducto({nombre:_this.txt_nombre_producto_add.val()});
            _this.txt_nombre_producto_add.val("");
        });
        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.propuestaDeTrueque",
                para: this.usuario.nombre
            }),
            callback: function(mensaje){
                var mercader = _.findWhere(_this.mercaderes, {nombre: mensaje.de});
                mercader.trueque.mio = mensaje.pido;
                mercader.trueque.suyo = mensaje.doy;
            
                mercader.trueque.envioPropuesta = "el";
                
                if(_this.mercaderSeleccionado === undefined) return;
                if(_this.mercaderSeleccionado.nombre != mercader.nombre) return;
                _this.panelInventarioDelOtro.setItemsTrueque(mercader.trueque.suyo);
                _this.panelInventarioUsuario.setItemsTrueque(mercader.trueque.mio);
                _this.btnProponerTrueque.hide();            
                _this.btnAceptarTrueque.show(); 
            }
        });  
        
        this.btnProponerTrueque = this.pantalla_mercado.find("#btnProponerTrueque");
        this.btnProponerTrueque.click(function(){
            vx.enviarMensaje({
                tipoDeMensaje:"trocador.propuestaDeTrueque",
                para: _this.mercaderSeleccionado.nombre,
                de: _this.usuario.nombre,
                pido: _this.mercaderSeleccionado.trueque.suyo,
                doy: _this.mercaderSeleccionado.trueque.mio
            });
            _this.mercaderSeleccionado.trueque.envioPropuesta = "yo";
            _this.btnProponerTrueque.hide(); 
        });
        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.aceptacionDeTrueque",
                para: this.usuario.nombre
            }),
            callback: function(mensaje){
                var mercader = _.findWhere(_this.mercaderes, {nombre: mensaje.de});
                _this.concretarTruequeCon(mercader);
                if(_this.mercaderSeleccionado === undefined) return;
                if(_this.mercaderSeleccionado.nombre != mercader.nombre) return;
                _this.panelInventarioDelOtro.setItemsTrueque(mercader.trueque.suyo);
                _this.panelInventarioUsuario.setItemsTrueque(mercader.trueque.mio);
                _this.btnProponerTrueque.show();            
                _this.btnAceptarTrueque.hide(); 
            }
        });  
        
        this.btnAceptarTrueque = this.pantalla_mercado.find("#btnAceptarTrueque");
        this.btnAceptarTrueque.click(function(){
            vx.enviarMensaje({
                tipoDeMensaje:"trocador.aceptacionDeTrueque",
                para: _this.mercaderSeleccionado.nombre,
                de: _this.usuario.nombre,
                pido: _this.mercaderSeleccionado.trueque.suyo,
                doy: _this.mercaderSeleccionado.trueque.mio
            });
            _this.concretarTruequeCon(_this.mercaderSeleccionado);
            _this.panelInventarioDelOtro.setItemsTrueque(_this.mercaderSeleccionado.trueque.suyo);
            _this.panelInventarioUsuario.setItemsTrueque(_this.mercaderSeleccionado.trueque.mio);
            _this.btnProponerTrueque.show();            
            _this.btnAceptarTrueque.hide(); 
        });
        
        this.btnRefrescarMercaderes = this.pantalla_mercado.find("#btn_refrescar");
        this.btnRefrescarMercaderes.click(function(){
            vx.enviarMensaje({
                tipoDeMensaje: "trocador.avisoDeIngreso",
                de: _this.usuario.nombre,
                inventario:_this.usuario.inventario
            });     
        });
        
        this.pantalla_mercado.show();
    },
    agregarMercader: function(nombre, inventario){
        var mercader = _.findWhere(this.mercaderes, {nombre:nombre});
        if( mercader !== undefined) {
            mercader.inventario = inventario;
            this.panelInventarioDelOtro.actualizar();
            return;
        }
        this.mercaderes.push({
            nombre: nombre,
            inventario:inventario||[],
            trueque: {
                suyo: [],
                mio: [],
                envioPropuesta: "ninguno"
            }
        });
        SelectorDeMercaderes.actualizar();
    },
    agregarProducto: function(producto){        
        producto.id = this.maximo_id_de_producto + 1;
        this.maximo_id_de_producto++;
        this.usuario.inventario.push(producto);
        this.panelInventarioUsuario.actualizar();
        vx.enviarMensaje({
            tipoDeMensaje:"trocador.avisoDeNuevoProducto",
            de: this.usuario.nombre,
            producto: producto
        });
    },
    quitarProducto: function(producto){
        this.usuario.inventario = $.grep(this.usuario.inventario, function(prod){
            return producto.id != prod.id;
        });
        this.panelInventarioUsuario.actualizar();
        vx.enviarMensaje({
            tipoDeMensaje:"trocador.avisoDeBajaDeProducto",
            de: this.usuario.nombre,
            producto: producto
        });
    },
    concretarTruequeCon: function(mercader){
        var _this = this;
        _.each(mercader.trueque.mio, function(pt){
            _this.quitarProducto(pt);
        });
        _.each(mercader.trueque.suyo, function(pt){
            _this.agregarProducto(pt)
        });
        mercader.trueque.mio.length = 0;
        mercader.trueque.suyo.length = 0;   
        this.btnAceptarTrueque.hide();
        this.btnProponerTrueque.show();
        mercader.trueque.envioPropuesta = "ninguno";
    }
    
};