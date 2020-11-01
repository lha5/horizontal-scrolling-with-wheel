import React, { useEffect, useState } from 'react'

import { Select } from 'antd';

const first = [
    {
        id: '1',
        name: 'A'
    },
    {
        id: '2',
        name: 'B'
    }
];

const second1 = [
    {
        id: '11',
        name: '가'
    },
    {
        id: '12',
        name: '나'
    },
    {
        id: '13',
        name: '다'
    }
];

const second2 = [
    {
        id: '21',
        name: '첫째'
    },
    {
        id: '22',
        name: '둘째'
    }
];

const third = [
    {
        id: '31',
        name: '마지막'
    }
];

function SelectBox() {
    const [ FirstValues, setFirstValues ] = useState([]);
    const [ SecondValues, setSecondValues ] = useState([]);
    const [ SecondSelected, setSecondSelected ] = useState('');
    const [ ThirdValues, setThirdValues ] = useState([]);
    const [ ThirdSelected, setThirdSelected ] = useState('');

    useEffect(() => {
        setFirstValues(first);
    }, []);

    const handleFirstSelect = (key) => {
        console.log('첫 번째 값 선택');
        setSecondSelected('');
        setThirdSelected('');
        if (key === '1') {
            console.log('값 : 1, A');
            setSecondValues(second1);
        } else if (key === '2') {
            console.log('id 값 : 2, B');
            setSecondValues(second2);
        }
    }

    const handleSecondSelect = (key) => {
        console.log('두 번째 값 선택');
        console.log('id 값 : ', key);
        setSecondSelected(key);
        setThirdSelected('');
        if (key === '22') {
            setThirdValues(third);
        } else {
            setThirdValues([]);
        }
    }

    const handleThirdSelect = (key) => {
        console.log('세 번째 값 선택');
        setThirdSelected(key);
    }

    return (
        <div>
            <Select
             style={{ width: 150 }}
             placeholder="선택하세요"
             onChange={handleFirstSelect}
            >
                {
                    FirstValues.map(value => (
                        <Select.Option key={value.id} value={value.id}>
                            {value.name}
                        </Select.Option>
                    ))
                }
            </Select>
            <Select
             style={{ width: 150 }}
             value={SecondSelected}
             onChange={handleSecondSelect}
             disabled={SecondValues.length === 0 ? true : false}
            >
                {
                    SecondValues.map(value => (
                        <Select.Option key={value.id} value={value.id}>
                            {value.name}
                        </Select.Option>
                    ))
                }
            </Select>
            <Select
             style={{ width: 150 }}
             value={ThirdSelected}
             onChange={handleThirdSelect}
             disabled={ThirdValues.length === 0 ? true : false}
            >
                {
                    ThirdValues.map(value => (
                        <Select.Option key={value.id} value={value.id}>
                            {value.name}
                        </Select.Option>
                    ))
                }
            </Select>
        </div>
    )
}

export default SelectBox
