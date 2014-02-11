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
            //url:'http://router-vortex.herokuapp.com',
            url:'http://localhost:3000',
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
                _this.nuevoMercader(mensaje.de);
                vx.enviarMensaje({
                    tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                    de: _this.usuario.nombre,
                    para: mensaje.de
                });
            }
        });  

        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                para: this.usuario.nombre
            }),
            callback: function(mensaje){
                _this.nuevoMercader(mensaje.de);
            }
        });
        
        vx.enviarMensaje({
            tipoDeMensaje: "trocador.avisoDeIngreso",
            de: this.usuario.nombre
        });
        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.pedidoDeInventario",
                para: this.usuario.nombre
            }),
            callback: function(mensaje){
                vx.enviarMensaje({
                    tipoDeMensaje: "trocador.respuestaAPedidoDeInventario",
                    inventario: _this.usuario.inventario,
                    de: _this.usuario.nombre,
                    para: mensaje.de
                });
            }
        });  

        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.respuestaAPedidoDeInventario",
                para: this.usuario.nombre
            }),
            callback: function(mensaje){
                var mercader = _.findWhere(_this.mercaderes, {nombre: mensaje.de});
                mercader.inventario = mensaje.inventario;
                mercader.yaMandoInventario = true;
            }
        }); 
        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDeNuevoProducto"
            }),
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.nombre) return;
                var mercader = _.findWhere(_this.mercaderes, {nombre: mensaje.de});
                if(mercader.yaMandoInventario) mercader.inventario.push(mensaje.producto);
                if(_this.mercaderSeleccionado === undefined) return;
                if(_this.mercaderSeleccionado.nombre == mercader.nombre) _this.panelInventarioDelOtro.actualizar();
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
                
                if(mercader.yaMandoInventario) return;
                vx.enviarMensaje({
                    tipoDeMensaje:"trocador.pedidoDeInventario",
                    de:_this.usuario.nombre,
                    para:mercader.nombre
                });
            }
        });

        this.btnAgregarProducto = this.pantalla_mercado.find("#btn_add_producto");
        this.txt_nombre_producto_add = this.pantalla_mercado.find("#txt_nombre_producto_add");
        this.btnAgregarProducto.click(function(){
            var producto = {
                nombre:_this.txt_nombre_producto_add.val()
            };
            producto.id = _this.usuario.inventario.length;
            _this.usuario.inventario.push(producto);
            _this.panelInventarioUsuario.actualizar();
            vx.enviarMensaje({
                tipoDeMensaje:"trocador.avisoDeNuevoProducto",
                de: _this.usuario.nombre,
                producto: producto
            });
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
                de: _this.usuario.nombre
            });        
        });
        
        this.pantalla_mercado.show();
    },
    nuevoMercader: function(nombre){
        if(_.findWhere(this.mercaderes, {nombre:nombre}) !== undefined) return;
        this.mercaderes.push({
            nombre: nombre,
            inventario:[],
            yaMandoInventario: false,
            trueque: {
                suyo: [],
                mio: []
            }
        });
        SelectorDeMercaderes.actualizar();
    },
    concretarTruequeCon: function(mercader){
        var _this = this;
        _.each(mercader.trueque.mio, function(pt){
            _this.usuario.inventario = _.reject(_this.usuario.inventario, function(pi){
                return pt.id == pi.id;
            });
            pt.id=mercader.inventario.length;
            mercader.inventario.push(pt);
        });
        _.each(mercader.trueque.suyo, function(pt){
            mercader.inventario = _.reject(mercader.inventario, function(pi){
                return pt.id == pi.id;
            });
            pt.id=_this.usuario.inventario.length;
            _this.usuario.inventario.push(pt);
        });
        mercader.trueque.mio.length = 0;
        mercader.trueque.suyo.length = 0;   
        this.btnAceptarTrueque.hide();
        this.btnProponerTrueque.show();
    }
    
};