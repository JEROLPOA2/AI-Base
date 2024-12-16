from openai import AssistantEventHandler
from openai.types.beta.threads import TextDelta, Text
from typing_extensions import override

class EventHandler(AssistantEventHandler):

    def __init__(self):
        super().__init__()
        self.response = ""

    @override
    def on_text_delta(self, delta: TextDelta, snapshot: Text) -> None:
        self.response += delta.value

    @override
    def on_tool_call_delta(self, delta, snapshot) -> None:
        """
        Handles tool calls, particularly those related to the code_interpreter.

        Args:
            delta (Any): The ToolCallDelta containing the information about the tool call.
            snapshot (Any): The current state of the assistant.
        """
        if delta.type == 'code_interpreter':
            if delta.code_interpreter.input:
                print(delta.code_interpreter.input)
            if delta.code_interpreter.outputs:
                for output in delta.code_interpreter.outputs:
                    if output.type == "logs":
                        print(output.logs)
