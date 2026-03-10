import React, { useEffect, useState } from 'react';
import { Stage, Layer, RegularPolygon, Text, Group } from 'react-konva';

interface IsometricMapProps {
  era: string;
  stats: any;
}

const TILE_SIZE = 60;
const GRID_SIZE = 10;

export const IsometricMap: React.FC<IsometricMapProps> = ({ era, stats }) => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderTiles = () => {
    const tiles = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        const posX = (x - y) * (TILE_SIZE * 0.8) + dimensions.width / 2;
        const posY = (x + y) * (TILE_SIZE * 0.4) + dimensions.height / 4;

        // Determine tile type based on era and stats
        let color = '#3d2b1f'; // Default mud/earth
        let stroke = '#D4AF37';
        if (era === 'Information') {
          color = '#0a0a1a';
          stroke = '#00FF9F';
        }

        tiles.push(
          <Group key={`${x}-${y}`} x={posX} y={posY}>
            <RegularPolygon
              sides={6}
              radius={TILE_SIZE}
              rotation={90}
              fill={color}
              stroke={stroke}
              strokeWidth={era === 'Information' ? 0.5 : 1}
              scaleY={0.5}
              opacity={era === 'Information' ? 0.8 : 1}
            />
            
            {/* Information Era Neon Circuits */}
            {era === 'Information' && (x + y) % 3 === 0 && (
              <RegularPolygon
                sides={6}
                radius={TILE_SIZE * 0.8}
                rotation={90}
                stroke="#FF00FF"
                strokeWidth={0.2}
                scaleY={0.5}
                dash={[5, 5]}
              />
            )}

            {/* Buildings */}
            {(x + y) % 7 === 0 && (
               <Group y={-15}>
                  <RegularPolygon
                    sides={4}
                    radius={15}
                    fill={era === 'Information' ? '#FF00FF' : '#E2725B'}
                    scaleY={2.5}
                    stroke={era === 'Information' ? '#00FF9F' : '#000'}
                    strokeWidth={0.5}
                    shadowBlur={era === 'Information' ? 10 : 0}
                    shadowColor="#FF00FF"
                  />
               </Group>
            )}

            {/* The World Wonder (Center of the map) */}
            {stats.has_wonder === 'true' && x === 5 && y === 5 && (
              <Group y={-40}>
                <RegularPolygon
                  sides={3}
                  radius={40}
                  fill={era === 'Information' ? '#00FF9F' : '#D4AF37'}
                  scaleY={3}
                  stroke="#fff"
                  strokeWidth={2}
                  shadowBlur={20}
                  shadowColor={era === 'Information' ? '#00FF9F' : '#D4AF37'}
                />
                <Text 
                  text="WONDER" 
                  y={-50} 
                  x={-25} 
                  fill="#fff" 
                  fontSize={10} 
                  fontStyle="bold"
                />
              </Group>
            )}
          </Group>
        );
      }
    }
    return tiles;
  };

  return (
    <div className="absolute inset-0 z-0">
      <Stage width={dimensions.width} height={dimensions.height}>
        <Layer>
          {renderTiles()}
        </Layer>
      </Stage>
    </div>
  );
};
