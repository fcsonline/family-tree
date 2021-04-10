import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { ExtMember } from '../../types'
import styles from './FamilyNode.module.css';
import { getYear, setYear, parse, differenceInDays } from 'date-fns'

interface Props {
  node: ExtMember;
  isRoot: boolean;
  search?: string,
  highlightBirthday: boolean,
  onClick: (id: string) => void;
  onSubClick: (id: string) => void;
  style?: React.CSSProperties;
}

export default React.memo<Props>(
  function FamilyNode({ node, isRoot, search, highlightBirthday, onClick, onSubClick, style }) {
    const dates = _.compact([node.birthday, node.deathday]).join(' - ')
    const captures = (node.image || '').match(/https:\/\/drive.google.com\/file\/d\/(.*)\/view/)
    const imageId = captures && captures[1]
    const isMatch = !!search && (new RegExp(_.escapeRegExp(search), 'i')).test(node.name)
    const imageSrc = `https://drive.google.com/thumbnail?id=${imageId}`

    const date = parse(node.birthday, 'd/M/yyyy', new Date())
    const currentDate = setYear(date, getYear(new Date()))
    const days = differenceInDays(currentDate, new Date())
    const birthdayThisWeek = highlightBirthday && days >= 0 && days < 15 && !node.deathday

    if (true) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 190" style={ { position: 'absolute', ...style}}>

          {imageId && (
            <>
              <defs>
                <pattern id={imageId || 'image'} x="0%" y="0%" height="100%" width="100%" viewBox="0 0 70 70">
                  <image x="0%" y="0%" width="70" height="70" xlinkHref={imageSrc}></image>
                </pattern>
              </defs>

              <circle className="medium" cx="95" cy="40" r="35" fill={ `url(#${imageId})` } stroke="lightblue" strokeWidth="2" />
            </>
          )}

          {!imageId && (
            <svg x="60" y="5" width="70" height="70"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}

          <text x="95" y="100" textAnchor="middle" className="small">{node.name || '-'}</text>
          <text x="95" y="130" textAnchor="middle" className="small">{node.from || '-'}</text>
          <text x="95" y="160" textAnchor="middle" className="small">
            {dates}
            {node.age && node.deathday && `(${node.age})`}
          </text>
        </svg>
      )
    }

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
          {imageId && (
            <img className={styles.image} src={imageSrc} alt={node.name} title={node.name} />
          )}
          {!imageId && (
            <div className={styles.anonymous}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <p className={styles.name}>{node.name || '-'}</p>

          <p className={styles.from}>{node.from || '-'}</p>

          <p className={styles.date}>
            {dates}
            {node.age && node.deathday && (
              <span className={styles.age}>({node.age})</span>
            )}
          </p>
        </div>
      </div>
    );
  }
);
