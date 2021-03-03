import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { IFamilyNode, IFamilyExtNode } from 'relatives-tree/lib/types';
import styles from './FamilyNode.module.css';
import { getYear, setYear, parse, differenceInDays } from 'date-fns'

interface Props {
  node: IExtMember;
  isRoot: boolean;
  search?: string,
  highlightBirthday: boolean,
  onClick: (id: string) => void;
  onSubClick: (id: string) => void;
  style?: React.CSSProperties;
}

export interface IMember extends IFamilyNode {
  name: string;
  from: string;
  birthday: string;
}

export interface IExtMember extends IFamilyExtNode {
  name: string;
  from: string;
  image: string;
  birthday: string;
  deathday: string;
}

export default React.memo<Props>(
  function FamilyNode({ node, isRoot, search, highlightBirthday, onClick, onSubClick, style }) {
    const dates = _.compact([node.birthday, node.deathday]).join(' - ')
    const captures = (node.image || '').match(/https:\/\/drive.google.com\/file\/d\/(.*)\/view/)
    const imageId = captures && captures[1]
    const isMatch = !!search && (new RegExp(_.escapeRegExp(search), 'i')).test(node.name)

    const date = parse(node.birthday, 'd/M/yyyy', new Date())
    const currentDate = setYear(date, getYear(new Date()))
    const days = differenceInDays(currentDate, new Date())
    const birthdayThisWeek = highlightBirthday && days >= 0 && days < 15 && !node.deathday

    return (
      <div
        className={classNames(
          styles.root,
          birthdayThisWeek && styles.birthday,
          isMatch && styles.match
        )}
        style={style}
        onClick={() => { onClick(node.id) }}
      >
        <div
          className={classNames(
            styles.inner,
            styles[node.gender],
            isRoot && styles.isRoot,
          )}
        >
          <p className={styles.name}>{node.name || '-'}</p>

          <p className={styles.from}>{node.from || '-'}</p>

          <p className={styles.date} title={days.toString()}>
            {dates}
          </p>
        </div>
        {node.hasSubTree && (
          <div
            className={classNames(styles.sub, styles[node.gender])}
            onClick={(e) => { e.stopPropagation(); onSubClick(node.id) }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {imageId && (
          <img className={styles.image} src={`https://drive.google.com/thumbnail?id=${imageId}`} alt={node.name} title={node.name} />
        )}
        {!imageId && (
          <div className={styles.anonymous}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    );
  }
);
