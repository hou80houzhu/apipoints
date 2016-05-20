/* 
 * @packet option;
 * @require main;
 */
Option({
    name:"root",
    option:{
        override_onendinit:function(){
            this.addChild({
                type:"@main.login"
            });
        },
        override_event_loginout:function(){
            console.log("======???");
            this.addChild({
                type:"@main.maincontainer",
                option:{
                    tree:{
                        url: basePath+"data/tree.json",
                        width:250
                    }
                }
            });
        }
    }
});

