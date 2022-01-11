# Guirlande Hub - Créer un module
La création d'un module se déroule en 2 parties. Le nouveau module doit être intégré à la fois dans le backend mais également dans la partie IoT, écrite en Python et disponible sur un autre repository : [la-guirlande/modules](https://github.com/la-guirlande/modules).

## Partie backend (TypeScript)
Tout d'abord, la logique du module doit être écrite dans le backend. Voici les étapes à suivre.

### Création de la logique du module
- Dans le répertoire `src/modules`, créer un nouveau répertoire ayant comme nom celui du module (exemple: `src/modules/led-strip`). Ce répertoire contiendra toute la logique du module.
- Dans le répertoire créé précédemment, créer une nouvelle classe héritant de la classe `src/modules/module.ts`. Cette classe devrait être nommée comme cela : `<my-module>-module.ts` (exemple : `led-strip-module.ts`). Cette classe contiendra la communication entre le backend et le module, c'est la classe principale du module.
- La classe mère `src/modules/module.ts` permet de réutiliser différentes méthodes afin de communiquer avec le module (via des websockets).
  - La méthode `send(event, data)` permet d'envoyer des données au module.
  - La méthode `listening(event, data)` permet de recevoir des données provenant du module. **Attention** : la méthode `listening(event, data)` doit être appelée dans la méthode `registerListeners()` qui doit obligatoirement être présente dans la classe du nouveau module (méthode abstraite). Cela permet d'enregistrer tous les listeners à chaque connection du module. Si le nouveau module n'a pas besoin de listeners, la méthode `registerListeners()` doit rester vide.
```ts
/* src/modules/led-strip/led-strip-module.ts */

import { ModuleDocument } from '../../models/module-model';
import ServiceContainer from '../../services/service-container';
import Module from '../module';

export default class LedStripModule extends Module {

  public constructor(container: ServiceContainer, doc: ModuleDocument) {
    super(container, doc);
  }

  /**
   * Sends a color.
   * 
   * @param red Red (between 0 and 255)
   * @param green Green (between 0 and 255)
   * @param blue Blue (between 0 and 255)
   */
  public sendColor(red: number, green: number, blue: number): void {
    this.send<LedStripModuleColorDataOut>('color', { red, green, blue });
  }

  protected registerListeners(): void {
    this.listening<LedStripModuleColorDataIn>('color', data => {
      console.log(data.color);
    });
  }
}

```

### Création du type du module
- Dans la classe `src/modules/module.ts`, ajouter un nouveau type dans l'énumération `ModuleType`. Le type du module doit vraissemblablement avoir le même nom que le répertoire créé précédemment dans `src/modules`, en snake case + majuscules. Sa valeur doit être un nombre non utilisé par d'autres types.
```ts
/* src/modules/module.ts */

export enum ModuleType {
  [...]
  LED_STRIP = 5
}
```
- Dans le service `src/services/module-service.ts`, ajouter l'instantiation du module dans la méthode `loadInternal()`. Il suffit d'ajouter le type précédemment créé dans le `switch`, et d'instantier le module via sa classe.
```ts
/* src/services/module-service.ts */

switch (doc.type) {
  [...]
  case ModuleType.LED_STRIP: return new LedStripModule(this.container, doc);
  [...]
}
```

### Création du contrôleur (optionnel)
il est parfois nécessaire de communiquer avec un module via des requêtes API. Par exemple, le module `LED_STRIP` possède un contrôleur qui expose des routes permettant de changer la couleur de la guirlande, ou exécuter une boucle.

Cette section est donc optionnelle, si aucun contrôleur n'est nécessaire, cela n'affectera pas le fonctionnement du module.

- Dans le répertoire `src/controllers`, créer un nouveau contrôleur portant le nom du module, exemple : `led-strip-module-controller.ts`. Ce contrôleur devrait avoir comme route `/modules/<module_type>` (exemple : `/modules/led_strip`).
```ts
/* src/controllers/led-strip-module-controller.ts */

import { Request, Response } from 'express';
import _ from 'lodash';
import LedStripModule from '../modules/led-strip/led-strip-module';
import { Loop, LoopError } from '../modules/led-strip/loop';
import { ModuleError, ModuleType } from '../modules/module';
import ServiceContainer from '../services/service-container';
import Controller from './controller';

/**
 * LED strip module controller.
 * 
 * This controller is used to manage led strip modules.
 */
export default class LedStripModuleController extends Controller {

  /**
   * Creates a new LED strip module controller.
   * 
   * @param container Services container
   */
  public constructor(container: ServiceContainer) {
    super(container, `/modules/${_.kebabCase(ModuleType[ModuleType.LED_STRIP])}`); // Endpoint : /modules/led_strip
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/color', handlers: this.sendColorHandler });
    this.registerEndpoint({ method: 'POST', uri: '/:moduleId/loop', handlers: this.sendLoopHandler });
  }

  /**
   * Sends a color.
   * 
   * Path: `POST /modules/led-strip/:moduleId/color`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async sendColorHandler(req: Request, res: Response): Promise<Response> {
    const { red, green, blue } = req.body;
    if (red == null || green == null || blue == null) {
      return res.status(400).json(this.container.errors.formatErrors({
        error: 'bad_request',
        error_description: 'Missing color(s) in body'
      }));
    }
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId) as LedStripModule;
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      module.sendColor(red, green, blue);
      return res.status(200).json();
    } catch (err) {
      this.logger.error(err);
      if (err instanceof ModuleError) {
        return res.status(400).json(this.container.errors.formatErrors({
          error: 'bad_request',
          error_description: err.message
        }))
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }

  /**
   * Sends a loop.
   * 
   * Path: `POST /modules/led-strip/:moduleId/loop`
   * 
   * @param req Express request
   * @param res Express response
   * @async
   */
  public async sendLoopHandler(req: Request, res: Response): Promise<Response> {
    const { loop: loopData } = req.body;
    try {
      const module = this.container.modules.modules.find(module => module.id === req.params.moduleId) as LedStripModule;
      if (module == null) {
        return res.status(404).json(this.container.errors.formatErrors({
          error: 'not_found',
          error_description: 'Module not found'
        }));
      }
      if (loopData == null) {
        module.sendLoop();
      } else {
        const loop = new Loop(loopData);
        module.sendLoop(loop);
      }
      return res.status(200).json();
    } catch (err) {
      this.logger.error(err);
      if (err instanceof ModuleError || err instanceof LoopError) {
        return res.status(400).json(this.container.errors.formatErrors({
          error: 'bad_request',
          error_description: err.message
        }))
      }
      return res.status(500).send(this.container.errors.formatServerError());
    }
  }
}
```
- Ne pas oublier d'enregistrer le contrôleur auprès du `controller-service.ts`.
```ts
/* src/services/controller-service.ts */

this.controllers = [
  [...]
  new LedStripModuleController(container)
];
```

## Partie module (Python)
Une fois que la logique du module côté backend est créée, la logique de la partie "client" doit être réalisée.

Pour rappel, les sources sont disponibles sur le repository [la-guirlande/modules](https://github.com/la-guirlande/modules). Le code est écrit en Python afin de pouvoir exécuter facilement le module sur une Raspberry PI.

Voici les étapes à suivre.

### Création de la logique du module
- Dans le répertoire `modules`, créer un nouveau répertoire ayant comme nom celui du module (exemple: `modules/led-strip`). Ce répertoire contiendra toute la logique du module.
- Créer un fichier nommé `__ini__.py` dans ce répertoire et le laisser vide.
- Créer un fichier `main.py` également dans ce répertoire. Ce fichier contiendra toute la logique du module.
- Pour pouvoir se connecter au backend, il faut utiliser la librairie `ghc` (Guirlande Hub Client) disponible dans `modules/utils/ghc.py`. Cette librairie contient tout le processus de communication entre le backend et le module (connexion, enregistrement, envoi / réception de données via websocket, etc...). Pour comprendre le fonctionnement de cette librairie, se référer à la [documentation de la communication des modules](./COMMUNICATION.md)
```py
""" modules/led_strip/main.py """

from modules.utils import ghc, color, project

module = ghc.Module(project.ModuleType.LED_STRIP.value, project.Paths.API_URL.value, project.Paths.WEBSOCKET_URL.value)
current_color = color.Color(0, 0, 0)

@module.listening('color')
def color_listener(data):
  global current_loop
  current_loop = []
  c = color.Color(data['red'], data['green'], data['blue'])
  print(' > Event "color" received :', c.to_array())
  set_color(c)

def set_color(color):
  current_color.set_color(color)
  print(color.to_array())
  # GPIO / PWM write here

module.connect()
module.wait()
```

### Création du type du module
- Dans le fichier `modules/utils/project.py`, ajouter un nouveau type dans l'énumération `ModuleType`. Le type du module doit vraissemblablement avoir le même nom que le répertoire créé précédemment dans `modules`, en snake case + majuscules. Sa valeur doit être un nombre non utilisé par d'autres types et doit correspondre à celle ajoutée dans l'énumération `ModuleType` côté backend.
```py
""" modules/utils/project.py """

class ModuleType(Enum):
  [...]
  LED_STRIP = 5
```
- Dans le script `scripts/start.py`, ajouter l'importation du module dans la méthode `__run(type)`. Il suffit d'ajouter le type précédemment créé dans le `switch`, et d'importer le module.
```py
""" scripts/start.py """

def __run(type):
  match type:
    [...]
    case project.ModuleType.LED_STRIP:
      from modules.led_strip import main
    [...]
```

## Conclusion
Une fois le module créé dans les parties backend et client, il est désormais possible de l'utiliser. La connexion et la communication entre le backend et le module devraient fonctionner.

Le démarrage du module est effectué via la commande `main.py start <module_type>`.

Le packaging du module est effectué via la commande `main.py package` (partie client).
