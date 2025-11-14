import React from 'react';
import { CustomSelect } from './CustomSelect';
import { RANDOM_TYPES, NUMBERS, POINTS, DISTRIBUTION_TYPES, DURATIONS } from './constants';

export const TestConfigSection = ({ testConfig, onChange, disabled }) => {
    return (
        <div className="flex items-center gap-6 flex-wrap">
            <CustomSelect
                label="Random Type"
                value={testConfig.randomType}
                options={RANDOM_TYPES}
                placeholder="Select Random Type"
                onChange={(val) => onChange('randomType', val)}
                disabled={disabled}
            />
            <CustomSelect
                label="Total Number"
                value={testConfig.totalNumber}
                options={NUMBERS}
                placeholder="Select number"
                onChange={(val) => onChange('totalNumber', val)}
                disabled={disabled}
            />
            <CustomSelect
                label="Total Points"
                value={testConfig.totalPoints}
                options={POINTS}
                placeholder="Select total points"
                onChange={(val) => onChange('totalPoints', val)}
                disabled={disabled}
            />
            <CustomSelect
                label="Point Distribution Type"
                value={testConfig.pointDistribution}
                options={DISTRIBUTION_TYPES}
                placeholder="Select type"
                onChange={(val) => onChange('pointDistribution', val)}
                disabled={disabled}
            />
            <CustomSelect
                label="Time Duration"
                value={testConfig.timeDuration}
                options={DURATIONS}
                placeholder="hh:mm:ss"
                onChange={(val) => onChange('timeDuration', val)}
                disabled={disabled}
            />
        </div>
    );
};