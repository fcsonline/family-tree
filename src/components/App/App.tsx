import React, { useState, useCallback } from 'react';
import nodes from '../../tree.json';
import ReactFamilyTree from 'react-family-tree';
import PinchZoomPan from '../PinchZoomPan/PinchZoomPan';
import FamilyNode from '../FamilyNode/FamilyNode';
import { IFamilyExtNode } from 'relatives-tree/lib/types';
import { IMember, IExtMember } from '../FamilyNode/FamilyNode';

import styles from './App.module.css';

const WIDTH = 200;
const HEIGHT = 100;

export default React.memo<{}>(
  function App() {
    const myID = nodes[0].id
    const [rootId, setRootId] = useState<string>(myID);
    const onResetClick = useCallback(() => setRootId(myID), [myID]);

    return (
      <div className={styles.root}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            FamilyTree demo
          </h1>
          <a href="https://github.com/SanichKotikov/react-family-tree-example">GitHub</a>
        </header>
        <PinchZoomPan
          min={0.5}
          max={2.5}
          captureWheel
          className={styles.wrapper}
        >
          <ReactFamilyTree
            nodes={nodes as IMember[]}
            rootId={rootId}
            width={WIDTH}
            height={HEIGHT}
            className={styles.tree}
            renderNode={(node: IFamilyExtNode) => (
              <FamilyNode
                key={node.id}
                node={node as IExtMember}
                isRoot={node.id === rootId}
                onSubClick={setRootId}
                style={{
                  width: WIDTH,
                  height: HEIGHT,
                  transform: `translate(${node.left * (WIDTH / 2)}px, ${node.top * (HEIGHT / 2)}px)`,
                }}
              />
            )}
          />
        </PinchZoomPan>
        {rootId !== myID && (
          <div className={styles.reset} onClick={onResetClick}>
            Reset
          </div>
        )}
      </div>
    );
  }
);
