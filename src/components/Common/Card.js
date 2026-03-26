// src/components/Common/Card.js
import React from 'react';

const Card = ({ title, children, onClick }) => {
        return ( <
            div className = "card"
            onClick = { onClick }
            style = {
                { cursor: onClick ? 'pointer' : 'default' } } > {
                title && < div className = "card-title" > { title } < /div>} { children } <
                /div>
            );
        };

        export default Card;