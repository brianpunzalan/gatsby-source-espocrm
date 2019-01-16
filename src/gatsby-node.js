const axios = require(`axios`)
const _ = require(`lodash`)
const crypto = require(`crypto`)
const { nodeFromData } = require(`./normalize`)

const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`)

exports.sourceNodes = async (
    { actions, createNodeId },
    { 
      baseUrl, 
      apiBase, 
      skipUserAuth = false, 
      username, 
      password, 
      useApiKey = false,
      apiKey,
      schema = []
    }
  ) => {

    const { createNode } = actions

    if (!skipUserAuth) {
      let auth = Buffer.from(username + ":" + password, 'ascii').toString('base64');
      const EspoApi = axios.create({
        baseURL: `${baseUrl}${apiBase}`,
        headers: {
          'Espo-Authorization': auth,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("\nOpening session..")
      const loginData = await EspoApi.get('App/user')
        .then(response => {
          return response.data
        })
        .catch(error => {
          console.error("\nError login request:", error)
          return false
        });
      
      console.log("\nSession using token: " + loginData.token)
      auth = Buffer.from(username + ":" + loginData.token, 'ascii').toString('base64');
      EspoApi.defaults.headers['Espo-Authorization'] = auth

      if (loginData) {
        // fetch data from the schema
        let entities = await Promise.all(_.map(schema, (entity) => {
          return EspoApi.get(entity.name)
            .then(response => {
              response.data.entityType = entity.name

              // fetch hasMany fields for each entity
              let dataList = response.data.list
              const hasManyFields = entity.hasMany

              let dataPromises = Promise.all(_.map(dataList, (data) => {
                return Promise.all(_.map(hasManyFields, (field) => {
                  return EspoApi.get(`${entity.name}/${data.id}/${field}`)
                    .then(fieldResult => {
                      const dataField = {
                        data: fieldResult.data.list,
                        field: field
                      }
                      return dataField
                    })
                }))
                  .then(dataFields => {
                    dataFields.forEach(dataField => {
                      data[dataField.field] = dataField.data
                    })
                    return data
                  })
              }))

              response.data.list = dataPromises
              
              return response.data
            })
            .catch(error => {
              console.error("\nError fetching Entity " + entity.name + ": ", error)
              return [];
            })
        })).then(entities => {
          return entities;
        })

        entities = await Promise.all(_.map(entities, (result) => result.list)).then(list => {
          for (let i = 0; i < entities.length; i++) {
            entities[i].list = list[i]
          }
          return entities
        })

        _.map(entities, result => {
          let list = result.list
          let entityType = result.entityType

          _.map(list, (item) => {
            createNode(nodeFromData(item, entityType, { createContentDigest, createNodeId }, loginData.token))
          })
        })
        
        console.log("\nClosing session..")
        await EspoApi.post('App/action/destroyAuthToken', { token: loginData.token })
          .then(response => {
            console.log("\nSuccessful close of session")
            return response.data
          })
          .catch(error => {
            console.error("\nError closing session");
          })
      }
    }
  }
