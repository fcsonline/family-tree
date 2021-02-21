import crypto from 'crypto'
import fetch from 'node-fetch'
import csv  from 'neat-csv'
import _ from 'lodash'

const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRz7IXuNUVIbhYCe8f-ERoYfpx4JZVGKijx6ksTc6NyJb9RbSjkMfgIitSg6gbsFA5UqK7UNg5bkFel/pub?gid=1970367138&single=true&output=csv'

const response = await fetch(url)
const text = await response.text()
const members = await csv(text)

const NAME='Nom'
const FATHER='Pare'
const MOTHER='Mare'
const GENDER='Gènere'
const FROM='Lloc de naixament'
const BIRTHDAY='Data de naixament'
const DEFUNCT='Data de defunció'
const MARRIAGEDAY='Data matrimoni'

const MALE='Home'
const FEMALE='Dona'

// Auxliary functions

const computeRelation = (member, type) => {
  // TODO: Ensure unique. Name are not unique.
  const name = member[NAME]
  const hash = crypto.createHash('sha1')
  const id = hash.update(name, 'utf-8').digest('hex')

  return {
    id,
    type
  }
}
const computeParents = (member) => {
  return _.map(
    _.filter(members, (item) => {
      return member[FATHER] === item[NAME] || member[MOTHER] === item[NAME]
    }),
    (member) => computeRelation(member, 'blood')
  )
}

const computeSiblings = (member) => {
  return _.map(
    _.filter(members, (item) => {
      return (
        member[FATHER] === item[FATHER] &&
        member[MOTHER] === item[MOTHER] &&
        member[NAME] !== item[NAME]
      )
    }),
    (member) => computeRelation(member, 'blood')
  )
}

const computeSpouses = (member) => {
  const spouses = _.map(
    _.filter(members, (item) => {
      return (
        member[NAME] === item[FATHER] ||
        member[NAME] === item[MOTHER]
      )
    }),
    (child) => {
      if (child[FATHER] === member[NAME]) {
        return _.find(members, (item) => item[NAME] === child[MOTHER])
      } else {
        return _.find(members, (item) => item[NAME] === child[FATHER])
      }
    }
  )

  return _.map(
    _.uniq(spouses),
    (member) => computeRelation(member, 'married')
  )
}

const computeChildren = (member) => {
  return _.map(
    _.filter(members, (item) => {
      return (
        member[NAME] === item[FATHER] ||
        member[NAME] === item[MOTHER]
      )
    }),
    (member) => computeRelation(member, 'blood')
  )
}

const computeGenre = (member) => {
  if (member[GENDER] === MALE) {
    return 'male'
  } else if (member[GENDER] === FEMALE) {
    return 'female'
  } else {
    return 'male' // TODO: Unknown
  }
}

const computeMember = (member) => {
  const name = member[NAME]
  const from = member[FROM]
  const birthday = member[BIRTHDAY]
  const deathday = member[DEFUNCT]
  const gender = computeGenre(member)
  const parents = computeParents(member)
  const siblings = computeSiblings(member)
  const spouses = computeSpouses(member)
  const children = computeChildren(member)

  // TODO: Ensure unique. Name are not unique.
  const hash = crypto.createHash('sha1')
  const id = hash.update(name, 'utf-8').digest('hex')

  return {
    id,
    name,
    from,
    birthday,
    deathday,
    gender,
    parents,
    siblings,
    spouses,
    children
  }
}

const output = members.map((member) => computeMember(member))

console.log(JSON.stringify(output))
