# Views

Conceptionally, a view is a structural unit of related UI elements. 

A view is an HMTL fragment that contains a body element, but no head element.

A page is a view that can be accessed with a dedicated URL.

A page is a view that is rendered using a page master.

A page master is an HTML document that defines the structure of HTML documents to be rendered by the server. 

A page master is automatically selected by the appsrvr, based on the user agent's capabilities. 

## Styling


## Controller

A view MAY define a dedicated Javascript view controller. There are two options:  

   1. As an inline script element. For this to work, the script element MUST use the ID 'viewController'.
   2. As an external script element. For this to work, the script element MUST use a 'src' attribute and use the ID 'viewController'. 

The 2nd method is preferred, since it allows caching. 

For both options, the controller MUST be defined as an AMD module.


View controllers are automatically loaded upon a page request. 