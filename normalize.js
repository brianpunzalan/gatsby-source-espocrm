const nodeFromData = (entity, entityType, { createContentDigest, createNodeId }, token ) => {
    console.log(entity)
    for (let key in entity) {
      if (entity.hasOwnProperty(key) && entity[key] === null) {
        entity[key] = '';
      }
    }
    
    return {
      id: createNodeId(entity.id),
      espo_id: entity.id,
      parent: null,
      children: [],
      ...entity,
      entityType: entityType,
      internal: {
        type: `Gatsby_Espo_${entityType}`,
        contentDigest: createContentDigest(entity),
        mediaType: 'application/json',
        token: token
      },
    }
  }
  
  exports.nodeFromData = nodeFromData