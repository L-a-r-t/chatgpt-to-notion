export default function automate() {
  const TAB_TIMEOUT = 60;
  const CHECKOUT_TAB_TIMEOUT = 10;
  const NOTIFICATION_TIMEOUT = 20;
  const uuid = "chatgpt_to_notion";
  let merchant = window.merchant || {};
 
  function isJson(string) {
    try {
      JSON.parse(string);
    } catch (error) {
      return false;
    }
 
    return true;
  }
 
  function replaceUrlParam(e, a, t) {
    const n = new URL(e);
 
    n.searchParams.set(a, t || "");
 
    return n.toString();
  }
 
   function showNotification() {
 
     chrome.storage.local.get(['hideIframeForever'], function(result) {
       if (result.hideIframeForever === undefined) { 
        chrome.storage.sync.set({ecoModeNotification: true})
 
         //listen to message for close de notification
         window.addEventListener('message', function(event) {
           if (event.data.action === 'hideIframe') {
               //hide notif
               document.getElementById('popupNotification').style.display = 'none';
               //set notificationAlreadyShown in storage for not showing the notification next time
               chrome.storage.local.set({notificationAlreadyShown: true}, async function() {});
           }
           if (event.data.action === 'hideIframeForever') {
               //hide notif
               document.getElementById('popupNotification').style.display = 'none';
               //set notificationAlreadyShown in storage for not showing the notification next time
               chrome.storage.local.set({hideIframeForever: true}, async function() {});
           }
         });
 
         //timeout for closing the notification
         // setTimeout(() => {
         //   document.body.removeChild(iframe);
         // }, NOTIFICATION_TIMEOUT * 1e3);
       }
     });
 
   }
 
 
  if (isJson(merchant)) {
    merchant = JSON.parse(merchant);
  }
 
 
 
   if (localStorage.mzrimpacthero_active) {
     const d =
       (new Date().getTime() - Number(localStorage.mzrimpacthero_active)) / 6e4;
 
     if (d > TAB_TIMEOUT) {
       delete localStorage.mzrimpacthero_active;
     }
   }
 
   if (localStorage.mzrimpacthero_active_checkout) {
     const d =
       (new Date().getTime() -
         Number(localStorage.mzrimpacthero_active_checkout)) /
       6e4;
 
     if (d > CHECKOUT_TAB_TIMEOUT) {
       delete localStorage.mzrimpacthero_active_checkout;
     }
   }
 
 
  chrome.runtime.sendMessage({ action: "get_tabstatus" }, (tabStatus) => {
    if (!tabStatus) {
 
      chrome.runtime.sendMessage(
        { action: "get_block_tab", merchantId: merchant.i },
        (tabBlock) => {
 
          chrome.runtime.sendMessage({
            action: "clear_block_tab",
            merchantId: merchant.i,
          });
 
          const t =
            (new Date().getTime() - Number(localStorage.mzrimpacthero_active)) /
            6e4;
 
          if (t > TAB_TIMEOUT) {
            delete localStorage.mzrimpacthero_active;
          }
 
          const t2 =
            (new Date().getTime() -
              Number(localStorage.mzrimpacthero_active_checkout)) /
            6e4;
 
          if (t2 > CHECKOUT_TAB_TIMEOUT) {
            delete localStorage.mzrimpacthero_active_checkout;
          }
 
          const pathsToCheck = ["checkout", "panier", "order", "commande", "cart", "basket", "trolley", "bag", "payment", "carrito", "cesta", "carro", "bolsa", "pago", "chariot", "paiement", "warenkorb", "einkaufswagen", "korb", "tasche", "kasse", "zahlung", "carrello", "cestino", "borsa", "carrinho", "cesto", "sacola", "pagamento"];
          const isCheckout = pathsToCheck.some(path => (document.location.pathname + document.location.hash).includes(path));
 
          if (
            !localStorage.mzrimpacthero_active ||
            (!localStorage.mzrimpacthero_active_checkout && isCheckout)
          ) {
            
            if (!localStorage.mzrimpacthero_active) {
              localStorage.mzrimpacthero_active = new Date().getTime();
            }
 
            if (!localStorage.mzrimpacthero_active_checkout && isCheckout) {
              localStorage.mzrimpacthero_active_checkout = new Date().getTime();
            }
 
 
            //-------we open tab only if user granted permissions -------
            chrome.storage.local.get(['permissionsGranted'], function(result) {
              if (result.permissionsGranted === true) {
                //if (isCheckout) {
                //    chrome.runtime.sendMessage({
                //      action: "open_tab",
                //      url: `https://impacthero.co/?title=${encodeURIComponent(uuid)}&fromcheckout=true&partnerurl=${encodeURIComponent(
                //        replaceUrlParam(merchant.l, "uuid", uuid),
                //      )}`,
                //    });
               //} else {
                       showNotification();
                       chrome.runtime.sendMessage({
                        action: "open_tab",
                        url: `https://impacthero.co/?title=${encodeURIComponent(uuid)}&partnerurl=${encodeURIComponent(
                          replaceUrlParam(merchant.l, "uuid", uuid),
                        )}`,
                     });
                //}
              }  
            });  
 
 
          }
        },
      );
    }
  });
 }