(function($)
{
    $.infut = {};

    $.infut.defaults =
    {
        namespace : '.infut',
        
        container : '@namespace-container',
        
        elements : '@namespace-element',
        remove : 'a@namespace-remove',
        counter : '@namespace-counter',
        dummy : '@namespace-dummy',

        buttons : '@namespace-buttons',
        append : 'a@namespace-append',

        id : 'infut-',
        
        maximum : null,
        minimum : null
    };

    $.infut.helpers = 
    {
        parseClassTokens : function(settings)
        {
            for (var element in settings)
            {
                switch (element)
                {
                    case 'namespace':
                    case 'buttons':
                    case 'container':
                    case 'elements':
                    case 'remove':
                    case 'append':
                    case 'counter':
                    case 'dummy':
                        settings[element] = $.infut.helpers.parseClassToken(settings, element);
                        break;
                }
            }
        },

        parseClassToken : function(settings, element)
        {
            return settings[element].replace(/(\@(counter|namespace|dummy|buttons|container|elements|remove|append))/g, function(match)
            {
                var token = match.replace('@', '');
                var value = settings[token];
                return value;
            });
        },

        getSettings : function(runtime)
        {
            var settings = $.extend({}, $.infut.defaults, runtime);

            $.infut.helpers.parseClassTokens(settings);

            return settings;
        }
    };

    $.fn.infut = function(runtime)
    {
        return this.each(function()
        {
            // Catch references to element.
            var infut = this;
            var $infut = $(this);

            // Generate settings.
            var settings = $.infut.helpers.getSettings(runtime);
            settings.id = $infut.data('id') || settings.id;

            // Get container
            var container = $( settings.container, $infut );

            // Get elements and their count
            var elements = $( settings.elements, container ).not( settings.dummy );
            var count = elements.length;

            // Prepare dummy element.
            var dummy = $( settings.dummy, container );

            // In case of initial dummy, hide it.
            if (dummy.length)
            {
                dummy.hide();
            }

            // If no initial dummy found, take first element.
            if (count && !dummy.length)
            {
                dummy = elements.first().clone();
            }

            if (!dummy.length)
            {
                throw 'No dummy found!';
            }
            
            $( ':input', dummy ).val('');

            // Removal
            container.on({
                click : function(e)
                {
                    if (settings.minimum === null || count > settings.minimum)
                    {
                        var element = $(this).parents(settings.elements);

                        if (element.length)
                        {
                            element.remove();
                            count--;

                            container.trigger('index');

                            // Remove disabled from append button.
                            $(settings.append, buttons).removeClass('disabled');

                            // Recount and recounter
                            if (count === settings.minimum)
                            {
                                $(this).addClass('disabled');
                            }
                        }
                    }
                }
            }, settings.elements + ' ' + settings.remove);

            // Reindex
            container.on({
                index : function()
                {
                    elements = $( settings.elements, this ).not( settings.dummy );

                    elements.each(function(index, element)
                    {
                        $( settings.counter, this ).text( index + 1);
                    });
                }
            });


            // Appending
            var buttons = $( settings.buttons, $infut );
            buttons.on({
                click : function()
                {
                    if (settings.maximum === null || count < settings.maximum)
                    {
                        var appendable = dummy.clone().show();

                        var id = (settings.id || appendable.data('id')).toString();

                        count++;

                        // Alter labels and input ids.
                        $('[for="' + id + '0"]', appendable).attr('for', id + count.toString());
                        $('#' + id + '0', appendable).attr('id', id + count.toString());

                        $( settings.counter, appendable).text( count );

                        appendable.appendTo(container).removeClass(settings.dummy.replace(/^\.+/, ''));

                        if (count === settings.maximum)
                        {
                            $(this).addClass('disabled');
                        }
                    }
                }
            }, settings.append);
        });
    };

    $(function()
    {
        $( $.infut.defaults.namespace ).infut();
    });
})(jQuery);