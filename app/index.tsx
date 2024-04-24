import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Canvas, Path, SkPath, Skia, TouchInfo, useTouchHandler } from '@shopify/react-native-skia';
import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TouchableOpacity, View, useAnimatedValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const path = Skia.Path.Make();
path.moveTo(128, 0);
path.lineTo(168, 80);
path.lineTo(256, 93);
path.lineTo(192, 155);
path.lineTo(207, 244);
path.lineTo(128, 202);
path.lineTo(49, 244);
path.lineTo(64, 155);
path.lineTo(0, 93);
path.lineTo(88, 80);
path.lineTo(128, 0);
path.close();

const colors = [
  '#405DE6', // Indigo
  '#5851DB', // Purple
  '#833AB4', // Dark Purple
  '#C13584', // Pink
  '#E1306C', // Red
  '#FD1D1D', // Bright Red
  '#F56040', // Orange
  '#F77737', // Bright Orange
  '#FCAF45', // Yellow
  '#FFDC80', // Light Yellow
  '#4CAF50', // Green
  '#5AC8FA', // Sky Blue
  '#0077B5', // LinkedIn Blue
  '#00AFF0', // Azure
  '#5578EB', // Blue
  '#CC3366', // Magenta
  '#DD2A7B', // Pink Red
  '#1AB7EA', // Cerulean
  '#6A0DAD', // Purple
  '#DD2E44', // Reddish Pink
  '#E95950', // Coral Red
  '#FCAF16', // Yellow Orange
  '#F09819', // Orange
  '#FFC20E', // Yellow
  '#D4D4D4', // Light Gray
  '#99AAB5', // Gray
];

export default function Home() {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const path = useRef<SkPath>(Skia.Path.Make());
  const [paths, setPaths] = useState<
    {
      color: string;
      data: SkPath;
    }[]
  >([]);
  const isDrawing = useSharedValue(false);

  const rActionsStyle = useAnimatedStyle(() => ({
    opacity: withSpring(!isDrawing.value ? 1 : 0),
  }));

  const handleSelectColor = useCallback((color: string) => {
    setSelectedColor(color);
  }, []);

  const onDrawingStart = useCallback(
    (touchInfo: TouchInfo) => {
      isDrawing.value = true;
      const { x, y } = touchInfo;

      const newPath = Skia.Path.Make();
      newPath.moveTo(x, y);
      path.current = newPath;
      setPaths((currentPaths) => [...currentPaths, { color: selectedColor, data: newPath }]);
    },
    [selectedColor]
  );

  const onDrawingActive = useCallback(
    (touchInfo: TouchInfo) => {
      const { x, y } = touchInfo;
      const lastPoint = path.current.getLastPt();
      const xMid = (lastPoint.x + x) / 2;
      const yMid = (lastPoint.y + y) / 2;

      path.current.quadTo(lastPoint.x, lastPoint.y, xMid, yMid);
    },
    [selectedColor]
  );

  const onDrawingEnd = useCallback(() => {
    isDrawing.value = false;
    setPaths((currentPaths) => {
      const newArray = [...currentPaths];
      newArray[newArray.length - 1].color = selectedColor;
      newArray[newArray.length - 1].data = path.current;

      return newArray;
    });
  }, [selectedColor]);

  const touchHandler = useTouchHandler(
    {
      onActive: onDrawingActive,
      onStart: onDrawingStart,
      onEnd: onDrawingEnd,
    },
    [onDrawingActive, onDrawingStart, onDrawingEnd]
  );

  const undo = useCallback(() => {
    setPaths((currentPaths) => {
      const newArray = [...currentPaths];
      newArray.pop();
      return newArray;
    });
  }, [setPaths]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Animated.View style={rActionsStyle} className=" ml-4">
        <View className="flex-row items-center gap-x-4 ">
          {colors.map((color) => {
            const isSelected = color === selectedColor;

            return (
              <TouchableOpacity
                key={color}
                disabled={isSelected}
                onPress={() => handleSelectColor(color)}>
                <View
                  style={{ backgroundColor: color }}
                  className="size-8 items-center justify-center rounded-full">
                  {isSelected ? (
                    <View className="size-7 rounded-full border-2 border-white" />
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          className={clsx(
            'mt-4 self-start rounded-full bg-gray-200 p-4',
            !paths.length ? 'opacity-25' : 'opacity-100'
          )}
          disabled={!paths.length}
          onPress={undo}>
          <MaterialCommunityIcons name="undo-variant" color="black" size={20} />
        </TouchableOpacity>
      </Animated.View>
      <View className="flex-1 bg-white">
        <Canvas onTouch={touchHandler} style={{ flex: 1, width: '100%' }}>
          {paths.map((path, index) => (
            <Path
              key={index}
              path={path.data}
              color={path.color}
              style={'stroke'}
              strokeWidth={2}
            />
          ))}
        </Canvas>
      </View>
    </SafeAreaView>
  );
}
