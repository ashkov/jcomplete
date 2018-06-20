(function ( $ ) {
    $.fn.jcomplete = function( options ){
        var me = $( this );
        
        var settings = $.extend({
            type: me.attr('data-type')?me.attr('data-type'):2,
            input_name: 'id_list',
            url: "/ajax.php",
            source: function(request, response){
                $.getJSON( settings.url, { term: request.term }, response );
            },

        }, options );
        this.settings = settings;
        me.attr("data-url", settings.url);
        me.attr("data-type", settings.type);
        this.get_items = function ( obj, result_to, text_to ) {
            console.log($(this));
            if(typeof this.settings['get_source'] === 'function'){
                src = this.settings['get_source']();
            }else{
                src = this.settings['get_source'];
            }
            console.log(src);
            $.getJSON(src).done(function(data){
                for(var p in data.positions){ 
                    if (!(p >>> 0 === parseFloat(p)))continue; //test for integer
                    $.fn.jcomplete.add_item(obj, result_to, text_to, data.positions[p].id, data.positions[p].name);
                }
                console.log(result_to);
            });
        }
        $.fn.jcomplete.mir = 2;
        //$.fn.jcomplete.settings = settings;
        var result_to = document.createElement("input");
        result_to.setAttribute('type', 'hidden');
        result_to.setAttribute('name', settings.input_name);
        var text_to = document.createElement("input");
        text_to.setAttribute('type', 'hidden');
        me.after(result_to);
        me.after(text_to);
        this.get_items(me, result_to, text_to);
        
        me.autocomplete({
            source: settings.source,
            type: settings.type,
            url: settings.url,
            minLength : 1,
            open : function(event,ui){
                var selected = (ui.item?ui.item.id:"")
                console.log('open', selected);
            },
            change : function(event,ui){
            },
            focus: function(){
                //предотвратить всавку во время фокуса
                return false;
            },
            select : function(event,ui){
                this.value = ""
                var selected = (ui.item?ui.item.id:"")
                var text = (ui.item?ui.item.value:"")
                $.fn.jcomplete.add_item(me, result_to, text_to, selected, text);

                return false;
            }
        }).keydown(function(event){
            if(event.keyCode==13&&$(this).val()!=""){
                event.preventDefault();
                $.fn.jcomplete.add_new(me, result_to, text_to, $(this).val());
                $(this).val("");
            }  
        });
        return this;
    };
    $.fn.jcomplete.split = function ( val ) {
        return val.split( /,\s*/ );
    }
    $.fn.jcomplete.add_new = function ( obj, result_to, text_to, text ){
        ajaxobj({object: 'positions', action: 'add_new', type: $.fn.jcomplete.settings['type'], text: text})
          .done(function(data){
                $.fn.jcomplete.add_item(obj, result_to, text_to, data['id'], text);

          });  

    }
//    $.fn.jcomplete.settings = function ( key ) {
//        return settings[key];
//    }
    $.fn.jcomplete.add_item = function (obj, result_to, text_to, id, value) {

        vl = $(result_to);
        if(vl.val()==''){
            ar=[]
        }else{
            ar = vl.val().split(',');
        }
        if(ar.indexOf(id) > -1)return false;
        ar.push(id);
        vl.val(ar.join(','));
        $(text_to).val(value);
        obj.after('<div position="'+id+'" class="jcomplete-position">' + value + '<a class="jcomplete-delete-anchor" position="'+id+'" href="#">x</a></div>');
        $(".jcomplete-delete-anchor[position='"+id+"']").on('click', function(){
            if(confirm('Вы действительно хотите удалить '+$(this).closest('div').text()+'?')){
                vl = $(result_to);
                if(vl.val()==''){
                    ar=[]
                }else{
                    ar = vl.val().split(',');
                }
                var index = ar.indexOf($(this).attr('position'));
                if(index > -1) {
                    ar.splice(index, 1);
                }
                vl.val(ar.join(','));
                $(this).closest('div').remove();
            }
            return false;
        });
    }

}( jQuery ) )
