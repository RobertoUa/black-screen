var jQuery = require('jquery');
var Terminal = require('./compiled/terminal');
var React = require('react');

var Board = React.createClass({
    getInitialState: function () {
        var terminal = new Terminal(getDimensions());
        jQuery(window).resize(function() {
            terminal.resize(getDimensions());
        });

        return {terminal: terminal};
    },
    componentDidMount: function () {
        this.state.terminal.on('invocation', function () {
            this.forceUpdate();
        }.bind(this));
    },
    render: function () {
        var invocations = this.state.terminal.invocations.map(function (invocation, index) {
            return (
                <Invocation key={index} invocation={invocation}/>
            )
        });
        return (
            <div id="board">
                <div id="invocations">
                    {invocations}
                </div>
                <StatusLine currentWorkingDirectory={this.state.terminal.currentDirectory}/>
            </div>
        );
    }
});

var Invocation = React.createClass({
    componentDidMount: function () {
        this.props.invocation.on('data', function () {
            this.forceUpdate();
        }.bind(this));
    },
    render: function () {
        return (
            <div className="invocation">
                <Prompt prompt={this.props.invocation.getPrompt()}/>
                {this.props.invocation.getBuffer().render()}
            </div>
        );
    }
});

var Prompt = React.createClass({
    getInputNode: function (event) {
        return this.refs.command.getDOMNode()
    },
    handleKeyDown: function (event) {
        if (event.keyCode == 13) {
            this.props.prompt.send(this.getInputNode().value);
        }

        // Ctrl+P, ↑.
        if ((event.ctrlKey && event.keyCode === 80) || event.keyCode === 38) {
            var prevCommand = this.props.prompt.history.getPrevious();
            if (typeof prevCommand != 'undefined') {
                this.getInputNode().value = prevCommand;
            }
        }

        // Ctrl+N, ↓.
        if ((event.ctrlKey && event.keyCode === 78) || event.keyCode === 40) {
            var command = this.props.prompt.history.getNext();
            this.getInputNode().value = command || '';
        }

        event.stopPropagation();
    },
    render: function () {
        return (
            <div className="prompt">
                <div className="prompt-decoration">
                    <div className="arrow"></div>
                </div>
                <input onKeyDown={this.handleKeyDown} type="text" ref="command" autoFocus="autofocus"/>
            </div>
        )
    }
});

var StatusLine = React.createClass({
    render: function () {
        return (
            <div id="status-line">
                <CurrentDirectory currentWorkingDirectory={this.props.currentWorkingDirectory}/>
            </div>
        )
    }
});

var CurrentDirectory = React.createClass({
    render: function () {
        return (
            <div id="current-directory">{this.props.currentWorkingDirectory}</div>
        )
    }
});

function getDimensions() {
    var letter = document.getElementById('sizes-calculation');
    return {
        columns: Math.floor(window.innerWidth / letter.clientWidth * 10),
        rows:    Math.floor(window.innerHeight / letter.clientHeight)
    };
}

jQuery(document).ready(function () {
    React.render(<Board />, document.getElementById('black-board'));
});

