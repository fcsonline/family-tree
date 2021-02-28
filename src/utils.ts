import { IMember } from './components/FamilyNode/FamilyNode';
import crypto, { Utf8AsciiLatin1Encoding } from 'crypto'
import { Gender, IRelation, RelationType } from 'relatives-tree/lib/types';
import Papa from 'papaparse'
import _ from 'lodash'

const NAME='Nom'
const FATHER='Pare'
const MOTHER='Mare'
const GENDER='Gènere'
const FROM='Lloc de naixament'
const BIRTHDAY='Data de naixament'
const DEFUNCT='Data de defunció'
// const MARRIAGEDAY='Data matrimoni'

const MALE='Home'
const FEMALE='Dona'

interface IHash<T> {
  [index: string]: T;
}

type Rows = Array<IHash<string>>

interface Relation {
  id: string,
  type: string
}

export interface Member {
  id: string,
  name: string,
  from: string,
  birthday: string,
  deathday: string,
  gender: Gender,
  parents: Array<IRelation>,
  siblings: Array<IRelation>,
  spouses: Array<IRelation>,
  children: Array<IRelation>
}

interface DataMember {
  id: string,
  name: string,
  father: string,
  mother: string,
  gender: string,
  from: string,
  birthday: string,
  deathday: string
}

type DataMembers = Array<DataMember>

 // Auxiliary functions
 const computeRelation = (member: DataMember, type: RelationType): IRelation => {
   return {
     id: member.id,
     type
   }
 }
 const computeParents = (members: DataMembers, member: DataMember): Array<IRelation> => {
   return _.map(
     _.filter(members, (item) => {
       return member.father === item.name || member.mother === item.name
     }),
     (member: DataMember) => computeRelation(member, 'blood')
   )
 }

 const computeSiblings = (members: DataMembers, member: DataMember): Array<IRelation> => {
   return _.map(
     _.filter(members, (item) => {
       return (
         member.father === item.father &&
         member.mother === item.mother &&
         member.name !== item.name
       )
     }),
     (member: DataMember) => computeRelation(member, 'blood')
   )
 }

 const computeSpouses = (members: DataMembers, member: DataMember): Array<IRelation> => {
   const children = _.filter(members, (item) => {
     return (
       member.name === item.father ||
       member.name === item.mother
     )
   })
   const spouses: DataMembers = _.uniq(_.compact(_.map(
     children,
     (child) => {
       if (child.father === member.name) {
         return _.find(members, (item) => item.name === child.mother)
       } else {
         return _.find(members, (item) => item.name === child.father)
       }
     }
   )))

   return _.map(
     spouses,
     (member: DataMember) => computeRelation(member, 'married')
   )
 }

 const computeChildren = (members: DataMembers, member: DataMember): Array<IRelation> => {
   return _.map(
     _.filter(members, (item) => {
       return (
         member.name === item.father ||
         member.name === item.mother
       )
     }),
     (member: DataMember) => computeRelation(member, 'blood')
   )
 }

 const computeGenre = (members: DataMembers, member: DataMember): Gender => {
   if (member.gender === MALE) {
     return 'male'
   } else if (member.gender === FEMALE) {
     return 'female'
   } else {
     return 'male' // TODO: Unknown
   }
 }

const computeMember = (members: DataMembers, member: DataMember) => {
   const gender = computeGenre(members, member)
   const parents = computeParents(members, member)
   const siblings = computeSiblings(members, member)
   const spouses = computeSpouses(members, member)
   const children = computeChildren(members, member)

   return {
     id: member.id,
     name: member.name,
     from: member.from,
     birthday: member.birthday,
     deathday: member.deathday,

     gender,
     parents,
     siblings,
     spouses,
     children
   }
 }

 const mapMembers = (rows: Rows) => {
   return rows.map((row) => {
     const name = row[NAME] as string
     const from = row[FROM] as string
     const birthday = row[BIRTHDAY] as string
     const deathday = row[DEFUNCT] as string
     const gender = row[GENDER] as string
     const father = row[FATHER] as string
     const mother = row[MOTHER] as string

     // NOTE: Ensure unique. Names are not unique sometimes...
     const hash = crypto.createHash('sha1')
     const id = hash.update(name, 'utf-8' as Utf8AsciiLatin1Encoding).digest('hex')

     return {
       id,
       name,
       father,
       mother,
       from,
       birthday,
       deathday,
       gender
     }
   })
}

const computeMembers = async (text: string): Promise<Array<IMember>> => {
  const { data } = Papa.parse<IHash<string>>(text, { header: true });

  const members: DataMembers = mapMembers(data)

  return members.map((member: DataMember) => computeMember(members, member))
}

export default computeMembers
