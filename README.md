# gatsby-source-espocrm

Source plugin for pulling entity data from EspoCRM.

Pulls data from an EspoCRM site with the use of their API specification that could be found [here](https://www.espocrm.com/documentation/development/api/).

You could checkout their [demo](http://demo.espocrm.com/advanced/).

## Install

`npm install --save gatsby-source-espocrm`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
        {
        resolve: `gatsby-source-espocrm`,
        options: {
            baseUrl: `http://my-espocrm-site.com/`, // domain of your EspoCRM site. Please check NOTE below.
            apiBase: `api/v1/`, // this could be changed if you have different api implementation, say api/v2.
            username: `<your username>`, // auth username.
            password: `<your password>`, // auth password.
            schema: [ // list of entities you want to get data from.
              {
                name: 'Account',      // <name> field is required. Should be the name of the entity
                hasMany: ['contacts'] // <hasMany> field is optional. This would fetch also the related entities on 'Account'
              },
              {
                name: 'Contact'
              }
            ]
        }
    }
  ],
}
```
This would fetch all data from the list of `entityTypes` declared and generate nodes. Specify the `schema` of the EspoCRM backend you want to be fetched into GraphQL (`please see comments on each line`). It would also terminate the session after `Build` process has been done to prevent multiple unclosed sessions.

## How to query

You can query nodes created from EspoCRM with the following:

```graphql
{
  allGatsbyEspoAccount {
    edges {
      node {
        id
        espo_id
        name
        contacts
        ...
      }
    }
  }
}
```

You could check more functions in GraphiQL like querying for a single node, etc.

You could generate pages based on the newly created nodes in your project's `gatsby-node.js`.

## Note

- You should resolve `CORS` issue by yourselves. I suggest putting the built code into the same domain of the website or custom configure your EspoCRM site to allow specific domains to have API access if you want them to be seperated.
- If you want to customized the generation of the fields on each node, use `gatsby-node.js` of your project.
- This plugin was developed with reference to [gatsby-source-drupal](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-drupal).