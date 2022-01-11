# Guirlande Hub - Communication entre le backend et les modules

## Fonctionnement
Le backend propose une partie spécialement conçue pour la communication avec les modules. Le workflow de cette communication se compose ainsi :

### Si le module n'est pas connu du backend
Le processus d'enregistrement du module démarre.

Le module va requêter sur `POST /modules/register` avec les données suivantes dans le body :
```JSON
{
  "type": <MODULE_TYPE>
}
```
> `MODULE_TYPE` correspond au type du module, par exemple `0` si c'est une guirlande LED. Un module connaît son type.

Le backend va ensuite enregistrer le module ainsi que son statut en `PENDING`, ce qui signifie que le module est enregistré mais pas encore validé par un utilisateur. La réponse donnée au module sera un token généré pour pouvoir communiquer via les websockets. Le module stockera ce token afin de pouvoir le réutiliser plus tard pour s'enregistrer auprès des websockets.

Le module va ensuite émettre sur l'évènement websocket `module.register` afin de s'enregistrer auprès des websockets. Seul le token est envoyé dans les données. En réponse, le backend émettra sur le même évènement uniquement si le module a été validé par un utilisateur (statut != `PENDING`). Si ce n'est pas le cas, aucune réponse ne sera émise, et le module continuera d'émettre de façon réccurente sur cet évènement. Si au bout d'un certain temps le module n'a toujours pas été validé, son enregistrement sera supprimé. Cela signifie que le backend émettra une erreur sur l'évènement `module.register`. Le module sera donc informé, et recommencera le processus d'enregistrement à partir du début.

Si le module est validé par un utilisateur, son statut passe à `OFFLINE`. Cependant, si le module émet encore sur l'évènement `module.register` avec son token, alors le backend pourra finalement l'enregistrer auprès des websockets et passer son statut à `ONLINE`. Le module sera informé via une réponse positive sur le même évènement, et pourra ainsi émettre sur tous les évènements disponibles pour son type de module.

### Si le module est connu du backend
Dans ce cas, seule l'étape d'enregistrement auprès des websockets sera nécessaire.

Le module va émettre sur l'évènement `module.register` avec son token et, s'il est bien enregistré (statut != `PENDING`), va recevoir en retour une réponse positive et sera enregistré auprès des websockets. Le module pourra donc émettre sur tous les évènement disponibles pour son type.
