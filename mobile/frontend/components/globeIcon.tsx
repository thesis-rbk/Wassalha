import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface GlobeIconProps {
    size?: number;
    color?: string;
}

export const GlobeIcon: React.FC<GlobeIconProps> = ({
    size = 100,
    color = '#00A0A0'
}) => {
    return (
        <View style={styles.container}>
            <Svg width={size} height={size} viewBox="0 0 512 512">
                <G>
                    {/* Main globe circle */}
                    <Path
                        d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48z"
                        fill={color}
                    />

                    {/* Continents */}
                    <Path
                        d="M256 48c-5.3 0-10.5.2-15.7.6 4.8 1.3 9.5 3.1 14 5.3 6.7 3.3 13 7.5 18.7 12.5 5.8 5 11 10.7 15.5 17 4.5 6.3 8.3 13.1 11.3 20.3 3 7.2 5.2 14.8 6.5 22.5 1.3 7.7 1.7 15.6 1.2 23.4-.5 7.8-2 15.5-4.4 22.9-2.4 7.4-5.7 14.5-9.8 21-4.1 6.5-8.9 12.5-14.4 17.8-5.5 5.3-11.5 9.9-18 13.6-6.5 3.7-13.4 6.5-20.5 8.4-7.1 1.9-14.5 2.8-21.8 2.8-7.3 0-14.7-.9-21.8-2.8-7.1-1.9-14-4.7-20.5-8.4-6.5-3.7-12.5-8.3-18-13.6-5.5-5.3-10.3-11.3-14.4-17.8-4.1-6.5-7.4-13.6-9.8-21-2.4-7.4-3.9-15.1-4.4-22.9-.5-7.8-.1-15.7 1.2-23.4 1.3-7.7 3.5-15.3 6.5-22.5 3-7.2 6.8-14 11.3-20.3 4.5-6.3 9.7-12 15.5-17 5.7-5 12-9.2 18.7-12.5 6.7-3.3 13.8-5.7 21-7.2C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48z"
                        fill="#FFFFFF"
                        fillOpacity="0.3"
                    />

                    {/* Meridians and parallels */}
                    <Path
                        d="M256 48c-5.3 0-10.5.2-15.7.6 4.8 1.3 9.5 3.1 14 5.3M256 464c114.9 0 208-93.1 208-208S370.9 48 256 48 48 141.1 48 256s93.1 208 208 208z"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <Path
                        d="M256 48v416M464 256H48M403 120l-294 272M120 109l272 294"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeOpacity="0.5"
                    />

                    {/* Small airplane path */}
                    <Path
                        d="M350 180c0 2.8-2.2 5-5 5s-5-2.2-5-5 2.2-5 5-5 5 2.2 5 5zM350 180c0 0-20 25-20 25"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </G>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
