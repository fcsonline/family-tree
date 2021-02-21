import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import { IFamilyNode, IFamilyExtNode } from 'relatives-tree/lib/types';
import styles from './FamilyNode.module.css';

interface Props {
  node: IExtMember;
  isRoot: boolean;
  onSubClick: (id: string) => void;
  style?: React.CSSProperties;
}

export interface IMember extends IFamilyNode {
  name: String;
  from: String;
  birthday: String;
}

export interface IExtMember extends IFamilyExtNode {
  name: String;
  from: String;
  birthday: String;
  deathday: String;
}

export default React.memo<Props>(
  function FamilyNode({ node, isRoot, onSubClick, style }) {
    const dates = _.compact([node.birthday, node.deathday]).join(' - ')

    return (
      <div className={styles.root} style={style}>
        <div
          className={classNames(
            styles.inner,
            styles[node.gender],
            isRoot && styles.isRoot,
          )}
        >
          <p className={styles.name}>{node.name || '-'}</p>

          <p className={styles.from}>{node.from || '-'}</p>

          <p className={styles.date}>
            {dates}
          </p>
        </div>
        {node.hasSubTree && (
          <div
            className={classNames(styles.sub, styles[node.gender])}
            onClick={() => onSubClick(node.id)}
          />
        )}
      </div>
    );
  }
);
